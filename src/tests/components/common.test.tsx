import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Sparkline } from "../../components/common/Sparkline";

describe("common components", () => {
  it("renders a status badge", () => {
    render(<StatusBadge status="saturated" />);
    expect(screen.getByText("Saturated")).toBeInTheDocument();
  });

  it("renders a sparkline for metric history", () => {
    const { container } = render(<Sparkline values={[1, 3, 2, 8]} />);
    expect(container.querySelector("polyline")).not.toBeNull();
  });
});
