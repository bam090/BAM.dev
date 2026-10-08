import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Observes the displayed Main; never calculates permutations or changes its data. */
final class TraceProbe {
    private static final List<Frame> frames = new ArrayList<>();
    private static int nextId;
    private static int sequence;

    private static final class Frame {
        final int id;
        final int depth;
        Integer i;
        int returnLine;

        Frame(int depth) {
            this.id = nextId++;
            this.depth = depth;
        }

        String json() {
            return "{\"id\":" + id + ",\"depth\":" + depth + ",\"i\":" + i + "}";
        }
    }

    private static Frame active() {
        return frames.isEmpty() ? null : frames.get(frames.size() - 1);
    }

    static void call(int actualDepthArgument, int sourceLine) {
        Frame caller = active();
        frames.add(new Frame(actualDepthArgument));
        emit("call", sourceLine, caller);
    }

    static void enter(int actualDepth, int sourceLine) {
        if (active().depth != actualDepth) throw new AssertionError("Incorrect call instrumentation");
        emit("enter", sourceLine);
    }

    static boolean condition(boolean actualCondition, int sourceLine) {
        emit("check", sourceLine);
        return actualCondition;
    }

    static boolean loop(int actualI, boolean actualCondition, int sourceLine) {
        active().i = actualI;
        emit("loop", sourceLine);
        return actualCondition;
    }

    static boolean used(boolean actualUsed, int sourceLine) {
        emit(actualUsed ? "skip" : "check", sourceLine);
        return actualUsed;
    }

    // Record only the source location here. The caller emits after Java actually returns.
    static void prepareReturn(int sourceLine) {
        active().returnLine = sourceLine;
    }

    static void returned() {
        Frame completed = frames.remove(frames.size() - 1);
        if (completed.returnLine == 0) throw new AssertionError("Missing return instrumentation");
        emit("return", completed.returnLine, completed);
    }

    static void emit(String event, int sourceLine) {
        emit(event, sourceLine, active());
    }

    private static void emit(String event, int sourceLine, Frame actor) {
        List<String> stack = new ArrayList<>();
        for (Frame frame : frames) stack.add(frame.json());
        // Serialize immediately: no mutable Main references survive into later observations.
        System.out.println("{\"index\":" + sequence++
            + ",\"event\":\"" + event + "\",\"line\":" + sourceLine
            + ",\"executingFrameId\":" + (actor == null ? "null" : actor.id)
            + ",\"executingDepth\":" + (actor == null ? "null" : actor.depth)
            + ",\"frames\":" + stack
            + ",\"path\":" + Main.path
            + ",\"used\":" + Arrays.toString(Main.used)
            + ",\"answers\":" + Main.results + "}");
    }
}
