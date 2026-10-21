import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { SourceAttributionBadge } from "../components/SourceAttributionBadge";

describe("SourceAttributionBadge (TC-LIB-08-003)", () => {
  it("renders with default CC BY-SA 4.0 license text", () => {
    render(
      <BrowserRouter>
        <SourceAttributionBadge />
      </BrowserRouter>,
    );

    expect(screen.getByText("CC BY-SA 4.0")).toBeDefined();
  });

  it("links to /sources by default", () => {
    render(
      <BrowserRouter>
        <SourceAttributionBadge />
      </BrowserRouter>,
    );

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/sources");
  });

  it("can display author information when requested", () => {
    render(
      <BrowserRouter>
        <SourceAttributionBadge showAuthors />
      </BrowserRouter>,
    );

    expect(screen.getByText("CC BY-SA 4.0")).toBeDefined();
    expect(screen.getByText(/Browne, Culligan/i)).toBeDefined();
  });

  it("renders non-link pill when showLink is false", () => {
    render(<SourceAttributionBadge showLink={false} />);

    expect(screen.getByText("CC BY-SA 4.0")).toBeDefined();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
