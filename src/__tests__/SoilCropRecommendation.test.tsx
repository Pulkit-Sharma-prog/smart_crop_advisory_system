import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SoilCropRecommendation from "../pages/SoilCropRecommendation";

describe("SoilCropRecommendation", () => {
  it("shows validation message for invalid pH", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SoilCropRecommendation />
      </MemoryRouter>,
    );

    const phInput = screen.getByLabelText(/soil pH/i);
    await user.clear(phInput);
    await user.type(phInput, "16");

    await user.click(screen.getByRole("button", { name: /generate recommendation/i }));

    expect(await screen.findByText("Please enter a valid value")).toBeInTheDocument();
  });
});
