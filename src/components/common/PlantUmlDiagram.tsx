import { useMemo, useState } from 'react';
import plantumlEncoder from 'plantuml-encoder';

interface PlantUmlDiagramProps {
  code: string;
}

export default function PlantUmlDiagram({ code }: PlantUmlDiagramProps) {
  const [failed, setFailed] = useState(false);

  const url = useMemo(() => {
    try {
      const encoded = plantumlEncoder.encode(code);
      return `https://www.plantuml.com/plantuml/svg/${encoded}`;
    } catch {
      return null;
    }
  }, [code]);

  if (!url || failed) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        Failed to render PlantUML diagram. Check the syntax and try again.
      </div>
    );
  }

  return (
    <div className="my-4 flex justify-center overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
      <img src={url} alt="PlantUML diagram" className="max-w-full h-auto" onError={() => setFailed(true)} />
    </div>
  );
}
