export default function Footer() {
  return (
    <footer>
      <div className="page-container flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Created by Sugar Santillan</p>
        <a
          href="https://github.com/sugar-s-santillan/startup"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          GitHub Repository
        </a>
      </div>
    </footer>
  );
}
