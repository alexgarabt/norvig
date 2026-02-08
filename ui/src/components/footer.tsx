export function Footer() {
  return (
    <footer className="text-center text-sm text-muted-foreground py-8 border-t">
      <p>
        Based on Peter Norvig's{" "}
        <a
          href="https://norvig.com/spell-correct.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          How to Write a Spelling Corrector
        </a>{" "}
        (2007)
      </p>
    </footer>
  );
}
