import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTour } from "@/hooks/useTour";

export function AppTour() {
  const { showTour, completeTour, dismissTour } = useTour();

  useEffect(() => {
    if (!showTour) return;

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Próximo",
      prevBtnText: "Anterior",
      doneBtnText: "Concluir",
      progressText: "{{current}} de {{total}}",
      popoverClass: "tour-popover",
      steps: [
        {
          element: "[data-tour='dashboard']",
          popover: {
            title: "🏠 Dashboard",
            description: "Bem-vindo! Aqui você vê seu progresso diário, streak e próximas atividades.",
            side: "bottom",
          },
        },
        {
          element: "[data-tour='subjects']",
          popover: {
            title: "📚 Trilhas de Estudo",
            description: "Clique aqui para acessar todas as disciplinas e temas do ENEM.",
            side: "top",
          },
        },
        {
          element: "[data-tour='subject-status']",
          popover: {
            title: "🎯 Progresso do Tema",
            description: "Clique no círculo para mudar o status:\n• Não iniciado → Em estudo\n• Em estudo → Em revisão\n• Em revisão → Consolidado",
            side: "right",
          },
        },
        {
          element: "[data-tour='reviews']",
          popover: {
            title: "🧠 Revisões RPA",
            description: "Suas revisões programadas aparecem aqui. O sistema agenda automaticamente 7 revisões por tema!",
            side: "top",
          },
        },
        {
          element: "[data-tour='questions']",
          popover: {
            title: "❓ Questões",
            description: "Pratique com questões de cada disciplina para testar seu conhecimento.",
            side: "top",
          },
        },
        {
          element: "[data-tour='essays']",
          popover: {
            title: "✍️ Redação",
            description: "Escreva redações, avalie por competência e acompanhe sua evolução.",
            side: "top",
          },
        },
        {
          element: "[data-tour='pomodoro']",
          popover: {
            title: "⏱️ Timer Pomodoro",
            description: "Use o timer para sessões de estudo focadas de 25 minutos.",
            side: "left",
          },
        },
        {
          element: "[data-tour='gamification']",
          popover: {
            title: "🏆 Gamificação",
            description: "Acompanhe seu streak, pontos e conquistas. Mantenha a consistência!",
            side: "left",
          },
        },
      ],
      onDestroyStarted: () => {
        completeTour();
        driverObj.destroy();
      },
      onCloseClick: () => {
        dismissTour();
        driverObj.destroy();
      },
    });

    // Start tour with a small delay to ensure elements are rendered
    const timeout = setTimeout(() => {
      driverObj.drive();
    }, 500);

    return () => {
      clearTimeout(timeout);
      driverObj.destroy();
    };
  }, [showTour, completeTour, dismissTour]);

  return null;
}
