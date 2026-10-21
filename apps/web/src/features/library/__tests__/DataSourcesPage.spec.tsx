import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { DataSourcesPage } from "../pages/DataSourcesPage";

vi.mock("../../dashboard/components/DashboardNavbar", () => ({
  DashboardNavbar: () => <div data-testid="mock-dashboard-navbar" />,
}));

describe("DataSourcesPage (TC-LIB-08-001, TC-LIB-08-002)", () => {
  it("renders page header, corpus research info, and author attributions", () => {
    render(
      <BrowserRouter>
        <DataSourcesPage />
      </BrowserRouter>,
    );

    expect(screen.getByTestId("mock-dashboard-navbar")).toBeDefined();
    expect(
      screen.getByRole("heading", { name: /Nguồn dữ liệu & Bản quyền|Data Sources & Licensing/i }),
    ).toBeDefined();

    // Check author attributions
    expect(screen.getAllByText(/Browne/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Culligan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Phillips/i).length).toBeGreaterThan(0);

    // Check corpus mentions
    expect(screen.getAllByText(/NGSL/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/TSL/i).length).toBeGreaterThan(0);
  });

  it("renders Creative Commons CC BY-SA 4.0 license information and external links", () => {
    render(
      <BrowserRouter>
        <DataSourcesPage />
      </BrowserRouter>,
    );

    const ccLinks = screen.getAllByRole("link", { name: /CC BY-SA 4.0|Creative Commons/i });
    expect(ccLinks.length).toBeGreaterThan(0);
    expect(ccLinks[0].getAttribute("href")).toContain("creativecommons.org/licenses/by-sa/4.0");

    const ngslLinks = screen.getAllByRole("link", { name: /newgeneralservicelist\.com|NGSL Project/i });
    expect(ngslLinks.length).toBeGreaterThan(0);
    expect(ngslLinks[0].getAttribute("href")).toContain("newgeneralservicelist.com");
  });

  it("displays explicit legal disclaimer regarding ETS, TOEIC, and IELTS trademarks", () => {
    render(
      <BrowserRouter>
        <DataSourcesPage />
      </BrowserRouter>,
    );

    expect(screen.getAllByText(/Educational Testing Service|ETS/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/TOEIC/i).length).toBeGreaterThan(0);
  });

  it("includes navigation link back to library or dashboard", () => {
    render(
      <BrowserRouter>
        <DataSourcesPage />
      </BrowserRouter>,
    );

    const backLink = screen.getByRole("link", { name: /Quay lại|Trở về|Back/i });
    expect(backLink).toBeDefined();
  });
});
