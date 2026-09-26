import dev.bam.runtime.SolutionInvoker.LearnerFailure;
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

public final class CtBrowserRunner implements TestExecutionListener {
  private final Set<String> discovered = new HashSet<>();
  private final Set<String> started = new HashSet<>();
  private final Set<String> finished = new HashSet<>();
  private int passed, wrong, runtime, skipped, aborted, infrastructure;
  private boolean planStarted, planFinished;
  private String message = "";

  public static String run(String testClass, String method, String signature) {
    CtBrowserRunner listener = new CtBrowserRunner();
    try {
      var request = LauncherDiscoveryRequestBuilder.request()
          .selectors(DiscoverySelectors.selectMethod(testClass, method, signature))
          .filters(EngineFilter.includeEngines("junit-jupiter"))
          .configurationParameter("junit.jupiter.execution.parallel.enabled", "false")
          .build();
      LauncherFactory.create().execute(request, listener);
    } catch (Throwable error) {
      listener.infrastructure++;
      listener.describe(error);
    }
    return listener.report();
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
      return multiple.getFailures().stream().anyMatch(CtBrowserRunner::learnerFailure);
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
  private static String quoted(String value) {
    StringBuilder out = new StringBuilder("\"");
    for (int i = 0; i < value.length() && i < 512; i++) {
      char c = value.charAt(i);
      if (c == '"' || c == '\\') out.append('\\').append(c);
      else if (c == '\n') out.append("\\n");
      else if (c == '\r') out.append("\\r");
      else if (c < 32) out.append(' ');
      else out.append(c);
    }
    return out.append('"').toString();
  }
  private String report() {
    boolean complete = planStarted && planFinished && !discovered.isEmpty()
        && discovered.equals(started) && started.equals(finished)
        && finished.size() == passed + wrong + runtime
        && skipped == 0 && aborted == 0 && infrastructure == 0;
    String outcome = !complete ? "engine_error" : runtime > 0 ? "runtime_error" : wrong > 0 ? "wrong_answer" : "passed";
    return "{\"outcome\":\"" + outcome + "\",\"discovered\":" + discovered.size()
        + ",\"started\":" + started.size() + ",\"finished\":" + finished.size()
        + ",\"passed\":" + passed + ",\"wrong\":" + wrong + ",\"runtime\":" + runtime
        + ",\"skipped\":" + skipped + ",\"aborted\":" + aborted
        + ",\"infrastructure\":" + infrastructure + ",\"planStarted\":" + planStarted
        + ",\"planFinished\":" + planFinished + ",\"message\":" + quoted(message) + "}";
  }
}
