import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ParamEditor, type Model, type Param } from "../src/main";

describe("ParamEditor", () => {
  it("renders inputs for all params", () => {
    const params: Param[] = [
      { id: 1, name: "Назначение", type: "string" },
      { id: 2, name: "Длина", type: "string" }
    ];
    const model: Model = { paramValues: [], colors: [] };

    render(<ParamEditor params={params} model={model} />);

    expect(screen.getByLabelText("Назначение")).toBeInTheDocument();
    expect(screen.getByLabelText("Длина")).toBeInTheDocument();
  });

  it("initializes values from model.paramValues", () => {
    const params: Param[] = [
      { id: 1, name: "Назначение", type: "string" },
      { id: 2, name: "Длина", type: "string" }
    ];
    const model: Model = {
      paramValues: [
        { paramId: 1, value: "повседневное" },
        { paramId: 2, value: "макси" }
      ],
      colors: []
    };

    render(<ParamEditor params={params} model={model} />);

    expect(screen.getByLabelText("Назначение")).toHaveValue("повседневное");
    expect(screen.getByLabelText("Длина")).toHaveValue("макси");
  });

  it("getModel() returns full Model with updated paramValues", () => {
    const params: Param[] = [
      { id: 1, name: "Назначение", type: "string" },
      { id: 2, name: "Длина", type: "string" }
    ];
    const model: Model = {
      paramValues: [{ paramId: 1, value: "повседневное" }],
      colors: [{ id: 10, name: "red" }]
    };

    const ref = React.createRef<ParamEditor>();
    render(<ParamEditor ref={ref} params={params} model={model} />);

    fireEvent.change(screen.getByLabelText("Назначение"), { target: { value: "праздничное" } });
    fireEvent.change(screen.getByLabelText("Длина"), { target: { value: "мини" } });

    const next = ref.current!.getModel();
    expect(next.colors).toEqual(model.colors);
    expect(next.paramValues).toEqual([
      { paramId: 1, value: "праздничное" },
      { paramId: 2, value: "мини" }
    ]);
  });
});
