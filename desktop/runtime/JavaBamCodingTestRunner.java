import dev.bam.runtime.SolutionInvoker.LearnerFailure;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;
import org.junit.platform.engine.TestExecutionResult;
import org.junit.platform.engine.discovery.DiscoverySelectors;
import org.junit.platform.launcher.EngineFilter;
import org.junit.platform.launcher.TestExecutionListener;
import org.junit.platform.launcher.TestIdentifier;
import org.junit.platform.launcher.TestPlan;
import org.junit.platform.launcher.core.LauncherDiscoveryRequestBuilder;
import org.junit.platform.launcher.core.LauncherFactory;
import org.opentest4j.MultipleFailuresError;

/** One original public method group in one supervised JVM, including its provider. */
final class BamCodingTestRunner implements TestExecutionListener {
    private final Set<String> discovered = new HashSet<>();
    private final Set<String> started = new HashSet<>();
    private final Set<String> finished = new HashSet<>();
    private int passed, wrong, runtime, skipped, aborted, infrastructure;
    private boolean planStarted, planFinished;
    private String message = "";

    public static void main(String[] args) throws Exception {
        BamCodingTestRunner listener = new BamCodingTestRunner();
        String testId = args.length == 4 ? args[3] : "invalid";
        try {
            if (args.length != 4 || !testId.matches("[a-z][a-z0-9-]*")) throw new IllegalArgumentException("Invalid CT invocation");
            var request = LauncherDiscoveryRequestBuilder.request()
                    .selectors(DiscoverySelectors.selectMethod(args[0], args[1], args[2]))
                    .filters(EngineFilter.includeEngines("junit-jupiter"))
                    .configurationParameter("junit.jupiter.execution.parallel.enabled", "false")
                    .build();
            LauncherFactory.create().execute(request, listener);
        } catch (Throwable error) {
            listener.infrastructure++;
            listener.describe(error);
        }
        listener.writeResult(testId);
    }

    @Override public void testPlanExecutionStarted(TestPlan plan) {
        if (planStarted) infrastructure++;
        planStarted = true;
        for (TestIdentifier root : plan.getRoots()) {
            for (TestIdentifier child : plan.getDescendants(root)) {
                if (child.isTest()) discovered.add(child.getUniqueId());
            }
        }
    }

    @Override public void testPlanExecutionFinished(TestPlan plan) {
        if (planFinished) infrastructure++;
        planFinished = true;
    }

    @Override public void dynamicTestRegistered(TestIdentifier test) {
        if (test.isTest() && !discovered.add(test.getUniqueId())) infrastructure++;
    }

    @Override public void executionStarted(TestIdentifier test) {
        if (test.isTest() && (!discovered.contains(test.getUniqueId()) || !started.add(test.getUniqueId()))) infrastructure++;
    }

    @Override public void executionSkipped(TestIdentifier test, String reason) {
        skipped++;
        if (message.isEmpty()) message = reason;
    }

    private static boolean learnerFailure(Throwable error) {
        if (error instanceof LearnerFailure) return true;
        if (error instanceof MultipleFailuresError multiple) {
            return multiple.getFailures().stream().anyMatch(BamCodingTestRunner::learnerFailure);
        }
        return false;
    }

    @Override public void executionFinished(TestIdentifier test, TestExecutionResult result) {
        if (!test.isTest()) {
            if (result.getStatus() != TestExecutionResult.Status.SUCCESSFUL) {
                infrastructure++;
                result.getThrowable().ifPresent(this::describe);
            }
            return;
        }
        if (!started.contains(test.getUniqueId()) || !finished.add(test.getUniqueId())) infrastructure++;
        switch (result.getStatus()) {
            case SUCCESSFUL -> passed++;
            case ABORTED -> aborted++;
            case FAILED -> {
                Throwable error = result.getThrowable().orElse(null);
                if (learnerFailure(error)) runtime++;
                else if (error instanceof AssertionError) wrong++;
                else infrastructure++;
                if (error != null) describe(error);
            }
        }
    }

    private void describe(Throwable error) {
        if (message.isEmpty()) message = error.getClass().getSimpleName() + ": " + String.valueOf(error.getMessage());
    }

    private void writeResult(String testId) throws Exception {
        boolean complete = planStarted && planFinished && !discovered.isEmpty()
                && discovered.equals(started) && started.equals(finished)
                && finished.size() == passed + wrong + runtime
                && skipped == 0 && aborted == 0 && infrastructure == 0;
        String outcome = !complete ? "engine_error" : runtime > 0 ? "runtime_error" : wrong > 0 ? "wrong_answer" : "passed";
        String detail = message.substring(0, Math.min(message.length(), 512));
        String frame = String.join("|", "BAMCT1", testId, outcome,
                Integer.toString(discovered.size()), Integer.toString(started.size()), Integer.toString(finished.size()),
                Integer.toString(passed), Integer.toString(wrong), Integer.toString(runtime),
                Integer.toString(skipped), Integer.toString(aborted), Integer.toString(infrastructure),
                Boolean.toString(planStarted), Boolean.toString(planFinished),
                Base64.getEncoder().encodeToString(detail.getBytes(StandardCharsets.UTF_8))) + "\n";
        try (FileOutputStream descriptor = new FileOutputStream("/dev/fd/3")) {
            descriptor.write(frame.getBytes(StandardCharsets.UTF_8));
            descriptor.flush();
        }
    }
}
