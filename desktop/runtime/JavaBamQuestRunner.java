import java.io.DataOutputStream;
import java.io.DataInputStream;
import java.io.FileOutputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

final class BamQuestRunner {
    private static final int RESULT_DESCRIPTOR = 3;
    private static final int MAX_MESSAGE_CHARS = 1024;
    private static final int MAX_ARRAY_LENGTH = 100_000;

    private BamQuestRunner() {}

    public static void main(String[] args) {
        try {
            if (args.length == 3 && args[0].equals("--array-v1")) {
                runArray(args[1], args[2]);
            } else if (args.length == 4) {
                runLong(args);
            } else {
                writeRuntimeError("실행 인수 계약이 올바르지 않습니다.");
            }
        } catch (InvocationTargetException error) {
            writeRuntimeError(describe(error.getTargetException()));
        } catch (Throwable error) {
            writeRuntimeError(describe(error));
        }
    }

    private static void runLong(String[] args) throws Exception {
        String entryPoint = args[0];
        int price = Integer.parseInt(args[1]);
        int quantity = Integer.parseInt(args[2]);
        int shippingFee = Integer.parseInt(args[3]);
        Class<?> solutionClass = Class.forName("Solution");
        Method method = solutionClass.getDeclaredMethod(
                entryPoint,
                int.class,
                int.class,
                int.class);
        requirePublicStatic(solutionClass, method, long.class);
        long actual = (long) method.invoke(null, price, quantity, shippingFee);
        writeRecord("returned\n" + actual);
    }

    private static void runArray(String entryPoint, String signature) throws Exception {
        if (!entryPoint.equals("solve")) {
            throw new IllegalArgumentException("배열 Quest 진입점이 올바르지 않습니다.");
        }
        if (!signature.equals("int-array-int-int-to-int-array")
                && !signature.equals("int-array-int-int-to-int")
                && !signature.equals("int-array-to-int-array")) {
            throw new IllegalArgumentException("배열 Quest signature가 올바르지 않습니다.");
        }
        boolean hasScalarArguments = !signature.equals("int-array-to-int-array");
        ArrayInput input = readArrayInput(hasScalarArguments);
        Class<?> solutionClass = Class.forName("Solution");

        if (signature.equals("int-array-int-int-to-int-array")) {
            Method method = solutionClass.getDeclaredMethod(
                    entryPoint,
                    int[].class,
                    int.class,
                    int.class);
            requirePublicStatic(solutionClass, method, int[].class);
            int[] before = input.values().clone();
            int[] actual = (int[]) method.invoke(
                    null,
                    input.values(),
                    input.second(),
                    input.third());
            writeArrayResult(actual, before, input.values());
            return;
        }
        if (signature.equals("int-array-int-int-to-int")) {
            Method method = solutionClass.getDeclaredMethod(
                    entryPoint,
                    int[].class,
                    int.class,
                    int.class);
            requirePublicStatic(solutionClass, method, int.class);
            int actual = (int) method.invoke(null, input.values(), input.second(), input.third());
            writeRecord("returned_int\n" + actual);
            return;
        }
        if (signature.equals("int-array-to-int-array")) {
            Method method = solutionClass.getDeclaredMethod(entryPoint, int[].class);
            requirePublicStatic(solutionClass, method, int[].class);
            int[] before = input.values().clone();
            int[] actual = (int[]) method.invoke(null, input.values());
            writeArrayResult(actual, before, input.values());
            return;
        }
    }

    private static ArrayInput readArrayInput(boolean hasScalarArguments) throws Exception {
        DataInputStream input = new DataInputStream(System.in);
        int length = input.readInt();
        if (length < 0 || length > MAX_ARRAY_LENGTH) {
            throw new IllegalArgumentException("배열 입력 길이가 올바르지 않습니다.");
        }
        int[] values = new int[length];
        for (int index = 0; index < length; index++) {
            values[index] = input.readInt();
        }
        int second = hasScalarArguments ? input.readInt() : 0;
        int third = hasScalarArguments ? input.readInt() : 0;
        if (input.read() != -1) {
            throw new IllegalArgumentException("배열 입력 뒤에 불필요한 데이터가 있습니다.");
        }
        return new ArrayInput(values, second, third);
    }

    private static void requirePublicStatic(
            Class<?> solutionClass,
            Method method,
            Class<?> returnType) {
        if (!Modifier.isPublic(solutionClass.getModifiers())
                || !Modifier.isPublic(method.getModifiers())
                || !Modifier.isStatic(method.getModifiers())
                || method.getReturnType() != returnType) {
            throw new IllegalArgumentException(
                    "Solution과 대상 메서드는 public이어야 하고 정확한 static 반환 타입을 사용해야 합니다.");
        }
    }

    private static void writeArrayResult(int[] actual, int[] before, int[] argument) {
        if (actual == null || actual.length > MAX_ARRAY_LENGTH) {
            throw new IllegalArgumentException("배열 반환값 길이가 올바르지 않습니다.");
        }
        StringBuilder csv = new StringBuilder();
        for (int index = 0; index < actual.length; index++) {
            if (index > 0) csv.append(',');
            csv.append(actual[index]);
        }
        writeRecord("returned_int_array\n"
                + csv
                + "\n"
                + Arrays.equals(before, argument)
                + "\n"
                + (actual != argument));
    }

    private record ArrayInput(int[] values, int second, int third) {}

    private static String describe(Throwable error) {
        String name = error.getClass().getSimpleName();
        String detail = error.getMessage();
        String message = detail == null || detail.isBlank() ? name : name + ": " + detail;
        return message.substring(0, Math.min(message.length(), MAX_MESSAGE_CHARS));
    }

    private static void writeRuntimeError(String message) {
        String encoded = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(message.getBytes(StandardCharsets.UTF_8));
        writeRecord("runtime_error\n" + encoded);
    }

    private static void writeRecord(String value) {
        byte[] payload = value.getBytes(StandardCharsets.UTF_8);
        try (DataOutputStream output = new DataOutputStream(
                new FileOutputStream("/dev/fd/" + RESULT_DESCRIPTOR))) {
            output.writeInt(payload.length);
            output.write(payload);
            output.flush();
        } catch (Exception error) {
            System.exit(70);
        }
    }
}
