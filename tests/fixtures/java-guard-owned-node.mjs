import path from "node:path";

const [nonceArgument, workRootArgument, modeArgument, extra] = process.argv.slice(2);
const nonce = /^--bam-owner-nonce=([a-f0-9]{64})$/u.exec(nonceArgument ?? "")?.[1];
const workRoot = /^--bam-work-root=(.+)$/u.exec(workRootArgument ?? "")?.[1];
const mode = /^--bam-mode=(normal|term-ignore)$/u.exec(modeArgument ?? "")?.[1];

if (!nonce || !workRoot || !path.isAbsolute(workRoot) || !mode || extra !== undefined) {
  process.exitCode = 2;
} else {
  process.on("SIGTERM", () => {
    if (mode === "normal") process.exit(0);
  });
  process.stdout.write(`READY ${process.pid}\n`);
  setInterval(() => {}, 1_000);
}
