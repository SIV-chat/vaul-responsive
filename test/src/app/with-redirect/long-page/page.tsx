export default function Page() {
  return (
    <div>
      <p style={{ paddingBottom: '120vh' }}>scroll down</p>
      <p data-testid="content">content only visible after scroll</p>
    </div>
  );
}
