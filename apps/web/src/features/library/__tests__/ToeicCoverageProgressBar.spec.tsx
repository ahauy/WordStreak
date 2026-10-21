import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToeicCoverageProgressBar } from "../components/ToeicCoverageProgressBar";

describe("ToeicCoverageProgressBar (TC-LIB-06-002)", () => {
  it("renders coverage percentage and breakdowns correctly", () => {
    render(
      <ToeicCoverageProgressBar
        coveragePercent={88.5}
        ngslCoveragePercent={85.0}
        tslCoveragePercent={3.5}
        maxEstimatedCoverage={98.5}
        totalWords={1200}
        learnedWords={350}
      />,
    );

    expect(screen.getByText("Độ phủ từ vựng TOEIC ước tính")).toBeInTheDocument();
    expect(screen.getByText("88.5%")).toBeInTheDocument();
    expect(screen.getByText("/ 98.5% tối đa")).toBeInTheDocument();

    // NGSL pill
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("/ 94.0%")).toBeInTheDocument();
    // TSL pill
    expect(screen.getByText("+3.5%")).toBeInTheDocument();
    expect(screen.getByText("/ +4.5%")).toBeInTheDocument();
    // Learned count
    expect(screen.getByText("350")).toBeInTheDocument();
    expect(screen.getByText("/ 1200 từ")).toBeInTheDocument();

    // Verify progress bar segment testids exist
    expect(screen.getByTestId("ngsl-bar-segment")).toBeInTheDocument();
    expect(screen.getByTestId("tsl-bar-segment")).toBeInTheDocument();
  });

  it("displays academic citation note for NGSL Project", () => {
    render(
      <ToeicCoverageProgressBar
        coveragePercent={50.0}
        ngslCoveragePercent={48.0}
        tslCoveragePercent={2.0}
      />,
    );

    expect(
      screen.getByText(/Browne, Culligan & Phillips \(NGSL Project\)/i),
    ).toBeInTheDocument();
  });
});
