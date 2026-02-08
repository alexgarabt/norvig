export function Header() {
  return (
    <header className="text-center space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        Norvig Spell Corrector
      </h1>
      <p className="text-muted-foreground">
        Interactive visualization of Peter Norvig's{" "}
        <a
          href="https://norvig.com/spell-correct.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          probabilistic spelling corrector
        </a>
      </p>
    </header>
  );
}
