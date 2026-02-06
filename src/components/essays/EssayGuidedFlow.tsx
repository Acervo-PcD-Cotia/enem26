import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GuidedData {
  thesis: string;
  argument_1: string;
  argument_2: string;
  intervention_agent: string;
  intervention_action: string;
  intervention_means: string;
  intervention_detail: string;
  intervention_purpose: string;
}

interface EssayGuidedFlowProps {
  theme: string;
  onComplete: (data: GuidedData, content: string) => void;
  initialData?: Partial<GuidedData>;
  initialContent?: string;
}

const steps = [
  { key: "thesis", title: "Tese", description: "Qual sua posição sobre o tema? Resuma em uma frase." },
  { key: "argument_1", title: "Argumento 1", description: "Seu primeiro argumento de apoio." },
  { key: "argument_2", title: "Argumento 2", description: "Seu segundo argumento de apoio." },
  { key: "intervention", title: "Proposta de Intervenção", description: "Como resolver o problema?" },
  { key: "writing", title: "Escreva sua redação", description: "Agora sim, com estrutura clara." },
];

export function EssayGuidedFlow({ theme, onComplete, initialData, initialContent }: EssayGuidedFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<GuidedData>({
    thesis: initialData?.thesis || "",
    argument_1: initialData?.argument_1 || "",
    argument_2: initialData?.argument_2 || "",
    intervention_agent: initialData?.intervention_agent || "",
    intervention_action: initialData?.intervention_action || "",
    intervention_means: initialData?.intervention_means || "",
    intervention_detail: initialData?.intervention_detail || "",
    intervention_purpose: initialData?.intervention_purpose || "",
  });
  const [content, setContent] = useState(initialContent || "");

  const canAdvance = () => {
    switch (currentStep) {
      case 0: return data.thesis.trim().length > 5;
      case 1: return data.argument_1.trim().length > 5;
      case 2: return data.argument_2.trim().length > 5;
      case 3: return data.intervention_agent.trim() && data.intervention_action.trim();
      case 4: return content.trim().length > 50;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(data, content);
  };

  const lineCount = content.split('\n').length;

  return (
    <div className="space-y-4">
      {/* Theme */}
      <div className="glass-card rounded-xl p-4">
        <p className="text-sm text-muted-foreground mb-1">Tema:</p>
        <p className="font-medium">{theme}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <div
            key={step.key}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentStep ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Etapa {currentStep + 1} de {steps.length}: {steps[currentStep].title}
      </p>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card rounded-xl p-5"
        >
          <h3 className="font-semibold mb-1">{steps[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{steps[currentStep].description}</p>

          {currentStep === 0 && (
            <Input
              value={data.thesis}
              onChange={(e) => setData({ ...data, thesis: e.target.value })}
              placeholder="Ex: A tecnologia agrava o isolamento social dos jovens."
              className="text-base"
            />
          )}

          {currentStep === 1 && (
            <Textarea
              value={data.argument_1}
              onChange={(e) => setData({ ...data, argument_1: e.target.value })}
              placeholder="Descreva seu primeiro argumento em poucas frases..."
              rows={3}
            />
          )}

          {currentStep === 2 && (
            <Textarea
              value={data.argument_2}
              onChange={(e) => setData({ ...data, argument_2: e.target.value })}
              placeholder="Descreva seu segundo argumento..."
              rows={3}
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Quem age? (Agente)</Label>
                <Input
                  value={data.intervention_agent}
                  onChange={(e) => setData({ ...data, intervention_agent: e.target.value })}
                  placeholder="Ex: O Ministério da Educação"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">O que faz? (Ação)</Label>
                <Input
                  value={data.intervention_action}
                  onChange={(e) => setData({ ...data, intervention_action: e.target.value })}
                  placeholder="Ex: deve criar programas de..."
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Como? (Meio)</Label>
                <Input
                  value={data.intervention_means}
                  onChange={(e) => setData({ ...data, intervention_means: e.target.value })}
                  placeholder="Ex: por meio de campanhas nas escolas"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Detalhamento</Label>
                <Input
                  value={data.intervention_detail}
                  onChange={(e) => setData({ ...data, intervention_detail: e.target.value })}
                  placeholder="Ex: com apoio de psicólogos escolares"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Para quê? (Finalidade)</Label>
                <Input
                  value={data.intervention_purpose}
                  onChange={(e) => setData({ ...data, intervention_purpose: e.target.value })}
                  placeholder="Ex: a fim de reduzir o isolamento digital"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              {/* Side guide */}
              <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                <p><strong>Tese:</strong> {data.thesis}</p>
                <p><strong>Arg 1:</strong> {data.argument_1}</p>
                <p><strong>Arg 2:</strong> {data.argument_2}</p>
                <p><strong>Intervenção:</strong> {data.intervention_agent} {data.intervention_action}</p>
              </div>
              <div className="relative">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva sua redação completa aqui..."
                  className="min-h-[250px] resize-none"
                />
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {lineCount}/30 linhas
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="flex-1"
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canAdvance()}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-1" />
            Salvar Redação
          </Button>
        )}
      </div>
    </div>
  );
}
