export function Error(error: never) {
  return (
    <p>
      <vscode-icon name="error"></vscode-icon>
      {error}
    </p>
  );
}
