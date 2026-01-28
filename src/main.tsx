import React from "react";
import ReactDOM from "react-dom/client";

export interface Param {
  id: number;
  name: string;
  type: "string";
}

export interface ParamValue {
  paramId: number;
  value: string;
}

export interface Color {
  id: number;
  name: string;
}

export interface Model {
  paramValues: ParamValue[];
  colors: Color[];
}

export interface Props {
  params: Param[];
  model: Model;
}

interface State {
  valuesByParamId: Record<number, string>;
}

type ParamRenderer<P extends Param = Param> = (args: {
  param: P;
  value: string;
  onChange: (next: string) => void;
}) => React.ReactNode;

const renderers: Record<Param["type"], ParamRenderer> = {
  string: ({ param, value, onChange }) => (
    <label style={{ display: "grid", gap: 4 }}>
      <span>{param.name}</span>
      <input
        aria-label={param.name}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </label>
  )
};

function buildInitialValuesByParamId(params: Param[], model: Model): Record<number, string> {
  const fromModel = new Map<number, string>();
  for (const pv of model.paramValues ?? []) fromModel.set(pv.paramId, pv.value ?? "");

  const values: Record<number, string> = {};
  for (const p of params) values[p.id] = fromModel.get(p.id) ?? "";
  return values;
}

function toParamValues(params: Param[], valuesByParamId: Record<number, string>): ParamValue[] {
  return params.map((p) => ({ paramId: p.id, value: valuesByParamId[p.id] ?? "" }));
}

export class ParamEditor extends React.Component<Props, State> {
  state: State = {
    valuesByParamId: buildInitialValuesByParamId(this.props.params, this.props.model)
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.params !== this.props.params || prevProps.model !== this.props.model) {
      this.setState({
        valuesByParamId: buildInitialValuesByParamId(this.props.params, this.props.model)
      });
    }
  }

  public getModel(): Model {
    return {
      ...this.props.model,
      paramValues: toParamValues(this.props.params, this.state.valuesByParamId)
    };
  }

  private setValue = (paramId: number, value: string) => {
    this.setState((s) => ({
      valuesByParamId: { ...s.valuesByParamId, [paramId]: value }
    }));
  };

  render() {
    const { params } = this.props;
    const { valuesByParamId } = this.state;

    return (
      <div style={{ display: "grid", gap: 12 }}>
        {params.map((param) => {
          const renderer = renderers[param.type];
          return (
            <div key={param.id}>
              {renderer({
                param,
                value: valuesByParamId[param.id] ?? "",
                onChange: (next) => this.setValue(param.id, next)
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

const demoParams: Param[] = [
  { id: 1, name: "Назначение", type: "string" },
  { id: 2, name: "Длина", type: "string" }
];

const initialModel: Model = {
  paramValues: [
    { paramId: 1, value: "повседневное" },
    { paramId: 2, value: "макси" }
  ],
  colors: []
};

const App: React.FC = () => {
  const editorRef = React.useRef<ParamEditor>(null);
  const [snapshot, setSnapshot] = React.useState<Model | null>(null);

  const handleDumpModel = () => {
    const model = editorRef.current?.getModel();
    if (model) setSnapshot(model);
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h1>ParamEditor demo</h1>
      <p>Отредактируйте параметры и нажмите «Показать модель».</p>

      <ParamEditor ref={editorRef} params={demoParams} model={initialModel} />

      <button style={{ marginTop: 16 }} onClick={handleDumpModel}>
        Показать модель
      </button>

      {snapshot && (
        <pre style={{ marginTop: 16, background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      )}
    </div>
  );
};

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

