package dev.bam.runtime;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

/** Package bridge only: arguments and return values retain their original identity. */
public final class SolutionInvoker {
    private SolutionInvoker() {}

    public static Object invoke(Class<?> returnType, Class<?>[] parameterTypes, Object[] arguments) {
        try {
            Class<?> solution = Class.forName("Solution");
            Method method = solution.getMethod("solve", parameterTypes);
            if (!Modifier.isPublic(solution.getModifiers()) || !Modifier.isStatic(method.getModifiers()) || method.getReturnType() != returnType) {
                throw new IllegalArgumentException("Solution.solve must be public static");
            }
            return method.invoke(null, arguments);
        } catch (InvocationTargetException error) {
            throw new LearnerFailure(error.getTargetException());
        } catch (ReflectiveOperationException | IllegalArgumentException | LinkageError error) {
            throw new LearnerFailure(error);
        }
    }

    public static final class LearnerFailure extends RuntimeException {
        public LearnerFailure(Throwable cause) { super(cause); }
    }
}
