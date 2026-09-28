import java.net.URI;
import java.nio.file.Files;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import org.eclipse.jdt.core.compiler.CategorizedProblem;
import org.eclipse.jdt.internal.compiler.ClassFile;
import org.eclipse.jdt.internal.compiler.CompilationResult;
import org.eclipse.jdt.internal.compiler.Compiler;
import org.eclipse.jdt.internal.compiler.DefaultErrorHandlingPolicies;
import org.eclipse.jdt.internal.compiler.ICompilerRequestor;
import org.eclipse.jdt.internal.compiler.batch.CompilationUnit;
import org.eclipse.jdt.internal.compiler.classfmt.ClassFileConstants;
import org.eclipse.jdt.internal.compiler.classfmt.ClassFileReader;
import org.eclipse.jdt.internal.compiler.env.ICompilationUnit;
import org.eclipse.jdt.internal.compiler.env.INameEnvironment;
import org.eclipse.jdt.internal.compiler.env.NameEnvironmentAnswer;
import org.eclipse.jdt.internal.compiler.impl.CompilerOptions;
import org.eclipse.jdt.internal.compiler.problem.DefaultProblemFactory;

public final class JrtCompiler {
  private static final class JrtNames implements INameEnvironment {
    private final FileSystem jrt = FileSystems.getFileSystem(URI.create("jrt:/"));
    private final org.eclipse.jdt.internal.compiler.batch.FileSystem junit;
    private final String[] typeNames = new String[2048];
    private final NameEnvironmentAnswer[] answers = new NameEnvironmentAnswer[2048];
    private int cached;
    int reads;

    JrtNames(boolean junitProfile) {
      this.junit = junitProfile ? new org.eclipse.jdt.internal.compiler.batch.FileSystem(
          new String[]{"/str/junit.jar"}, new String[0], "UTF-8") : null;
    }

    private static String join(char[][] parts, char[] last) {
      StringBuilder name = new StringBuilder();
      if (parts != null) {
        for (char[] part : parts) {
          if (!valid(part)) return null;
          if (name.length() > 0) name.append('/');
          name.append(part);
        }
      }
      if (last != null) {
        if (!valid(last)) return null;
        if (name.length() > 0) name.append('/');
        name.append(last);
      }
      return name.toString();
    }

    private static boolean valid(char[] segment) {
      if (segment == null || segment.length == 0) return false;
      for (char c : segment) {
        if (c == '/' || c == '\\' || c == '.' || c == 0) return false;
      }
      return true;
    }

    private static boolean publicScope(String name) {
      return name != null &&
          (name.equals("java") || name.startsWith("java/") ||
           name.equals("javax") || name.startsWith("javax/"));
    }

    private NameEnvironmentAnswer lookup(String name) {
      if (name == null) return null;
      if (!publicScope(name)) {
        if (this.junit == null) return null;
        String[] parts = name.split("/");
        char[][] compound = new char[parts.length][];
        for (int i = 0; i < parts.length; i++) compound[i] = parts[i].toCharArray();
        return this.junit.findType(compound);
      }
      for (int i = 0; i < this.cached; i++) {
        if (name.equals(this.typeNames[i])) return this.answers[i];
      }
      Path path = this.jrt.getPath("/modules/java.base/" + name + ".class");
      NameEnvironmentAnswer answer = null;
      if (Files.isRegularFile(path)) {
        try {
          byte[] bytes = Files.readAllBytes(path);
          ClassFileReader reader = new ClassFileReader(bytes, path.toString().toCharArray());
          answer = new NameEnvironmentAnswer(reader, null);
          this.reads++;
        } catch (Exception error) {
          throw new IllegalStateException("JRT class read failed: " + name, error);
        }
      }
      if (this.cached == this.typeNames.length) throw new IllegalStateException("JRT lookup cache full");
      this.typeNames[this.cached] = name;
      this.answers[this.cached++] = answer;
      return answer;
    }

    public NameEnvironmentAnswer findType(char[][] compoundTypeName) {
      if (compoundTypeName == null || compoundTypeName.length == 0) return null;
      char[][] parent = new char[compoundTypeName.length - 1][];
      System.arraycopy(compoundTypeName, 0, parent, 0, parent.length);
      return lookup(join(parent, compoundTypeName[compoundTypeName.length - 1]));
    }

    public NameEnvironmentAnswer findType(char[] typeName, char[][] packageName) {
      return lookup(join(packageName, typeName));
    }

    public boolean isPackage(char[][] parentPackageName, char[] packageName) {
      String name = join(parentPackageName, packageName);
      return publicScope(name)
          ? Files.isDirectory(this.jrt.getPath("/modules/java.base/" + name))
          : this.junit != null && this.junit.isPackage(parentPackageName, packageName);
    }

    public void cleanup() { this.cached = 0; if (this.junit != null) this.junit.cleanup(); }
  }

  private static final int MAX_CLASSES = 256;
  private static final int MAX_CLASS_BYTES = 8 * 1024 * 1024;
  private static final int MAX_DIAGNOSTICS = 100;
  private static final int MAX_DIAGNOSTIC_CHARS = 32 * 1024;
  private static final char[] BASE64 =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".toCharArray();

  private static String encode(byte[] bytes) {
    StringBuilder out = new StringBuilder((bytes.length + 2) / 3 * 4);
    for (int i = 0; i < bytes.length; i += 3) {
      int value = (bytes[i] & 255) << 16;
      if (i + 1 < bytes.length) value |= (bytes[i + 1] & 255) << 8;
      if (i + 2 < bytes.length) value |= bytes[i + 2] & 255;
      out.append(BASE64[value >>> 18]);
      out.append(BASE64[(value >>> 12) & 63]);
      out.append(i + 1 < bytes.length ? BASE64[(value >>> 6) & 63] : '=');
      out.append(i + 2 < bytes.length ? BASE64[value & 63] : '=');
    }
    return out.toString();
  }

  private static void quote(StringBuilder out, String value) {
    out.append('"');
    for (int i = 0; i < value.length(); i++) {
      char c = value.charAt(i);
      if (c == '"' || c == '\\') out.append('\\').append(c);
      else if (c == '\n') out.append("\\n");
      else if (c == '\r') out.append("\\r");
      else if (c == '\t') out.append("\\t");
      else if (c < 32 || c == 0x2028 || c == 0x2029) {
        String hex = Integer.toHexString(c);
        out.append("\\u");
        for (int zero = hex.length(); zero < 4; zero++) out.append('0');
        out.append(hex);
      } else out.append(c);
    }
    out.append('"');
  }

  private static int column(String source, int offset) {
    if (offset < 0 || offset >= source.length()) return 1;
    int start = offset;
    while (start > 0 && source.charAt(start - 1) != '\n' && source.charAt(start - 1) != '\r') start--;
    return offset - start + 1;
  }

  private static boolean safeName(String name) {
    String[] parts = name.split("/", -1);
    for (String part : parts) {
      if (part.isEmpty() || !Character.isJavaIdentifierStart(part.charAt(0))) return false;
      for (int i = 1; i < part.length(); i++) {
        if (!Character.isJavaIdentifierPart(part.charAt(i))) return false;
      }
    }
    return true;
  }

  private static String[] unpack(String frame) {
    if (frame == null || frame.length() > 256 * 1024) throw new IllegalArgumentException("Invalid source frame");
    int colon = frame.indexOf(':');
    if (colon < 1 || colon > 2) throw new IllegalArgumentException("Invalid source frame");
    int count = Integer.parseInt(frame.substring(0, colon));
    if (count < 4 || count > 18 || (count & 1) != 0) throw new IllegalArgumentException("Invalid source count");
    String[] fields = new String[count];
    int cursor = colon + 1;
    for (int i = 0; i < count; i++) {
      colon = frame.indexOf(':', cursor);
      if (colon < cursor || colon - cursor > 6) throw new IllegalArgumentException("Invalid field length");
      int length = Integer.parseInt(frame.substring(cursor, colon));
      cursor = colon + 1;
      if (length < 0 || length > frame.length() - cursor) throw new IllegalArgumentException("Invalid field bounds");
      fields[i] = frame.substring(cursor, cursor + length);
      cursor += length;
    }
    if (cursor != frame.length()) throw new IllegalArgumentException("Unexpected frame suffix");
    return fields;
  }

  // Only trusted ECJ and this helper run here; learner output stays as class bytes.
  public static String compile(String frame) {
    String[] fields = unpack(frame);
    final String profile = fields[0];
    final String entryClass = fields[1];
    if (!("quest".equals(profile) || "junit".equals(profile)) || !"Solution".equals(entryClass)) {
      throw new IllegalArgumentException("Unsupported compiler profile or entry class");
    }
    final int unitCount = (fields.length - 2) / 2;
    final String[] paths = new String[unitCount];
    final String[] sourceTexts = new String[unitCount];
    final ICompilationUnit[] units = new ICompilationUnit[unitCount];
    for (int i = 0; i < unitCount; i++) {
      paths[i] = fields[2 + i * 2];
      sourceTexts[i] = fields[3 + i * 2];
      units[i] = new CompilationUnit(sourceTexts[i].toCharArray(), paths[i], "UTF-8");
    }
    boolean observerSource = false;
    for (String path : paths) if ("BamQuestObserver.java".equals(path)) observerSource = true;
    final boolean allowObserver = observerSource && "quest".equals(profile);
    JrtNames environment = new JrtNames("junit".equals(profile));
    try {
      final String[] names = new String[MAX_CLASSES];
      final byte[][] classes = new byte[MAX_CLASSES][];
      final String[] diagnostics = new String[MAX_DIAGNOSTICS];
      final int[] lines = new int[MAX_DIAGNOSTICS];
      final int[] columns = new int[MAX_DIAGNOSTICS];
      final int[] state = new int[4]; // class count, class bytes, diagnostic count, diagnostic chars
      final boolean[] failed = { false };
      CompilerOptions options = new CompilerOptions();
      options.complianceLevel = ClassFileConstants.JDK17;
      options.originalComplianceLevel = ClassFileConstants.JDK17;
      options.sourceLevel = ClassFileConstants.JDK17;
      options.originalSourceLevel = ClassFileConstants.JDK17;
      options.targetJDK = ClassFileConstants.JDK17;
      options.enablePreviewFeatures = false;
      options.processAnnotations = false;
      Compiler compiler = new Compiler(environment,
          DefaultErrorHandlingPolicies.proceedWithAllProblems(), options,
          new ICompilerRequestor() {
            public void acceptResult(CompilationResult result) {
              String path = new String(result.getFileName());
              String source = "";
              for (int i = 0; i < paths.length; i++) if (paths[i].equals(path)) source = sourceTexts[i];
              CategorizedProblem[] problems = result.getAllProblems();
              if (problems != null) {
                for (CategorizedProblem problem : problems) {
                  if (!problem.isError()) continue;
                  failed[0] = true;
                  if (state[2] >= MAX_DIAGNOSTICS) continue;
                  String message = problem.getMessage();
                  if (message == null) message = "Java compile error";
                  if (!"Solution.java".equals(path)) message = path + ": " + message;
                  int remaining = MAX_DIAGNOSTIC_CHARS - state[3];
                  if (remaining <= 0) continue;
                  if (message.length() > remaining) message = message.substring(0, remaining);
                  int index = state[2]++;
                  diagnostics[index] = message;
                  lines[index] = problem.getSourceLineNumber() > 0 ? problem.getSourceLineNumber() : 1;
                  columns[index] = column(source, problem.getSourceStart());
                  state[3] += message.length();
                }
              }
              if (result.hasErrors()) failed[0] = true;
              for (ClassFile file : result.getClassFiles()) {
                String internalName = new String(file.fileName());
                byte[] bytes = file.getBytes();
                if (!safeName(internalName) || internalName.equals("JrtCompiler")
                    || internalName.startsWith("JrtCompiler$")
                    || internalName.equals("CtBrowserRunner")
                    || internalName.startsWith("CtBrowserRunner$")
                    || (!allowObserver && (internalName.equals("BamQuestObserver")
                        || internalName.startsWith("BamQuestObserver$")))
                    || state[0] >= MAX_CLASSES ||
                    bytes.length > MAX_CLASS_BYTES - state[1]) {
                  failed[0] = true;
                  continue;
                }
                names[state[0]] = internalName.replace('/', '.');
                classes[state[0]++] = bytes;
                state[1] += bytes.length;
              }
            }
          }, new DefaultProblemFactory());
      compiler.compile(units);
      boolean foundSolution = false;
      for (int i = 0; i < state[0]; i++) if (entryClass.equals(names[i])) foundSolution = true;
      if (!foundSolution) failed[0] = true;
      if (failed[0] && state[2] == 0) {
        diagnostics[0] = "Solution.java must define a default-package Solution class and stay within output limits";
        lines[0] = 1;
        columns[0] = 1;
        state[2] = 1;
      }
      StringBuilder json = new StringBuilder(128 + state[1] * 4 / 3);
      json.append("{\"status\":\"").append(failed[0] ? "compile_error" : "compiled")
          .append("\",\"diagnostics\":[");
      for (int i = 0; i < state[2]; i++) {
        if (i > 0) json.append(',');
        json.append("{\"message\":");
        quote(json, diagnostics[i]);
        json.append(",\"line\":").append(lines[i])
            .append(",\"column\":").append(columns[i]).append('}');
      }
      json.append("],\"classesBase64\":{");
      if (!failed[0]) {
        for (int i = 0; i < state[0]; i++) {
          if (i > 0) json.append(',');
          quote(json, names[i]);
          json.append(':');
          quote(json, encode(classes[i]));
        }
      }
      return json.append("}}").toString();
    } finally {
      environment.cleanup();
    }
  }
}
