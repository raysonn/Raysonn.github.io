/**
 * Gerenciador de Interações do Portfólio
 * Responsável por:
 * - Flip cards de tecnologias
 * - Quiz técnico
 * - Visualização interativa de arquitetura
 */

(function($) {
  "use strict";

  // ===== TECH CARDS - Flip Animation =====
  $(document).on('click', '.interactive-card', function() {
    $(this).toggleClass('flipped');
  });

  // Efeito hover para melhor UX
  $('.interactive-card').on('mouseenter', function() {
    $(this).css('cursor', 'pointer');
  });

  // ===== QUIZ TÉCNICO =====
  const quizData = [
    {
      question: "Qual padrão arquitetural é melhor para escalabilidade horizontal?",
      options: [
        "Microserviços",
        "Monolítico tradicional com load balancer",
        "Serverless com função por request",
        "MVC com cache distribuído",
        "SOA com orquestração centralizada"
      ],
      correct: 0,
      explanation: "Microserviços permitem escalar serviços individuais independentemente, ideal para sistemas distribuídos e crescimento não-uniforme."
    },
    {
      question: "O que é eventual consistency em sistemas distribuídos?",
      options: [
        "Dados eventualmente convergem para o mesmo estado após propagação",
        "Todos os dados são sincronizados em tempo real",
        "Dados sincronizam após timeout de falha",
        "Garantia de consistência forte com replicação",
        "Modelo onde cada nó tem sua própria versão permanente"
      ],
      correct: 0,
      explanation: "Eventual consistency significa que após um período sem updates, todos os acessos retornarão o mesmo valor. Escolha comum em sistemas distribuídos."
    },
    {
      question: "Qual é o principal benefício de usar RabbitMQ em uma arquitetura?",
      options: [
        "Desacoplar sistemas e permitir processamento assíncrono",
        "Aumentar velocidade de resposta das APIs",
        "Armazenar dados de forma persistente e durável",
        "Substituir a camada de banco de dados",
        "Implementar autenticação entre serviços"
      ],
      correct: 0,
      explanation: "RabbitMQ é um message broker que desacopla produtores de consumidores, permitindo processamento assíncrono e aumentando resiliência."
    },
    {
      question: "O que SOLID em programação representa?",
      options: [
        "Conjunto de cinco princípios de design orientado a objetos",
        "Uma metodologia de testes e garantia de qualidade",
        "Um padrão de estrutura de banco de dados relacional",
        "Framework para desenvolvimento web em JavaScript",
        "Abordagem de versionamento semântico de APIs"
      ],
      correct: 0,
      explanation: "SOLID é um acrônimo para: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion."
    },
    {
      question: "Qual é a vantagem principal de usar containers (Docker)?",
      options: [
        "Isolamento de ambiente e consistência entre desenvolvimento e produção",
        "Melhor performance de processamento que máquinas virtuais",
        "Redução automática de custos infraestrutura em 50%",
        "Facilita apenas deployment em ambientes cloud",
        "Gerenciamento centralizado de todas as aplicações"
      ],
      correct: 0,
      explanation: "Docker containers garantem que o ambiente dev, teste e produção sejam idênticos, resolvendo o problema 'funciona na minha máquina'."
    },
    {
      question: "O que é CQRS (Command Query Responsibility Segregation)?",
      options: [
        "Separação de operações de leitura e escrita em modelos diferentes",
        "Um padrão de cache distribuído como Redis ou Memcached",
        "Técnica de compressão de dados em trânsito pela rede",
        "Protocolo de comunicação entre microsserviços",
        "Padrão de autenticação com múltiplos fatores de segurança"
      ],
      correct: 0,
      explanation: "CQRS separa o modelo de escrita (Command) do modelo de leitura (Query), otimizando cada um para sua responsabilidade específica."
    },
    {
      question: "Qual é o propósito principal de um API Gateway?",
      options: [
        "Rotear requisições, fazer rate limiting e autenticação centralizada",
        "Armazenar dados de requisições de forma persistente",
        "Compilar e otimizar código backend antes do deploy",
        "Gerenciar licenças de software e componentes open source",
        "Sincronizar estado entre múltiplos datacenters"
      ],
      correct: 0,
      explanation: "Um API Gateway atua como ponto único de entrada para chamadas de API, facilitando roteamento, segurança, rate limiting e monitoramento."
    },
    {
      question: "O que é idempotência em APIs REST?",
      options: [
        "Executar a mesma operação múltiplas vezes com o mesmo resultado",
        "Capacidade de ser acessada sem exigir autenticação explícita",
        "Velocidade de resposta garantida menor que 100ms",
        "Suporte simultâneo para múltiplos formatos de dados (JSON, XML)",
        "Capacidade de reverter operações de escrita facilmente"
      ],
      correct: 0,
      explanation: "Uma operação idempotente produz o mesmo resultado independentemente de quantas vezes é chamada, essencial para operações de retry seguras."
    },
    {
      question: "Qual padrão é usado para sincronizar estado entre múltiplas instâncias?",
      options: [
        "Event Sourcing combinado com cache distribuído (Redis)",
        "Cache compartilhado em memória com lock distribuído",
        "Replicação de banco de dados com sincronização em tempo real",
        "Fila de mensagens com polling contínuo de status",
        "Broadcast periódico de estado para todos os nós"
      ],
      correct: 0,
      explanation: "Event Sourcing registra todos os eventos, permitindo reconstruir estado. Cache distribuído (Redis) sincroniza estado em tempo real."
    },
    {
      question: "O que é uma saga em microsserviços?",
      options: [
        "Padrão para gerenciar transações distribuídas coordenando múltiplos serviços",
        "Um tipo de documento histórico armazenado em MongoDB",
        "Sequência de requisições HTTP encadeadas com callbacks",
        "Método de criptografia simétrica para dados sensíveis",
        "Tipo de webhook que dispara eventos periodicamente"
      ],
      correct: 0,
      explanation: "Uma saga é um padrão que gerencia transações distribuídas através de uma sequência de eventos locais, garantindo consistência eventual."
    }
  ];

  let currentQuestion = 0;
  let score = 0;
  let quizAnswered = false;
  let quizQuestions = [];

  // Função para embaralhar array (Fisher-Yates)
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Função para embaralhar opções mantendo rastreamento da resposta correta
  function getShuffledQuestion(question) {
    const options = [...question.options];
    const correctOption = options[question.correct];
    
    // Embaralhar opções
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Encontrar novo índice da resposta correta
    const newCorrect = options.indexOf(correctOption);
    
    return {
      options: options,
      correct: newCorrect
    };
  }

  function initQuiz() {
    currentQuestion = 0;
    score = 0;
    quizAnswered = false;
    quizQuestions = shuffleArray([...quizData]);
    displayQuestion();
  }

  function displayQuestion() {
    if (currentQuestion >= quizQuestions.length) {
      displayResult();
      return;
    }

    const questionData = quizQuestions[currentQuestion];
    const shuffled = getShuffledQuestion(questionData);
    
    // Armazenar opções e resposta correta embaralhadas
    questionData.displayOptions = shuffled.options;
    questionData.displayCorrect = shuffled.correct;
    
    // Atualizar pergunta
    $('#quiz-question').text(questionData.question);
    
    // Limpar opções anteriores
    $('#quiz-options').empty();
    
    // Criar botões de opção
    shuffled.options.forEach((option, index) => {
      const button = $('<button/>')
        .addClass('quiz-option')
        .attr('data-index', index)
        .text(option)
        .click(function() {
          if (!quizAnswered) {
            selectOption(index, shuffled.correct, questionData.explanation);
          }
        });
      
      $('#quiz-options').append(button);
    });

    // Atualizar progresso
    $('#quiz-counter').text(`Pergunta ${currentQuestion + 1} de ${quizQuestions.length}`);
    $('#quiz-counter').show();
    
    // Esconder controles
    $('#quiz-feedback').hide();
    $('#quiz-next-btn').hide();
    $('#quiz-restart-btn').hide();
    $('#quiz-result').hide();
    
    quizAnswered = false;
  }

  function selectOption(selectedIndex, correctIndex, explanation) {
    quizAnswered = true;
    
    const isCorrect = selectedIndex === correctIndex;
    
    // Desabilitar todas as opções
    $('.quiz-option').prop('disabled', true).css('pointer-events', 'none');
    
    // Mostrar resposta correta e incorreta selecionada
    $('.quiz-option').each(function(index) {
      if (index === correctIndex) {
        $(this).addClass('correct');
      } else if (index === selectedIndex && !isCorrect) {
        $(this).addClass('incorrect');
      }
    });
    
    // Atualizar score
    if (isCorrect) {
      score++;
    }
    
    // Mostrar feedback
    const feedbackClass = isCorrect ? 'correct' : 'incorrect';
    const feedbackText = isCorrect ? 
      `✓ Correto! ${explanation}` : 
      `✗ Incorreto. ${explanation}`;
    
    $('#quiz-feedback')
      .removeClass('correct incorrect')
      .addClass(feedbackClass)
      .text(feedbackText)
      .show();
    
    // Mostrar botão próxima pergunta
    $('#quiz-next-btn').show();
    $('#quiz-restart-btn').hide();
  }

  function nextQuestion() {
    currentQuestion++;
    
    // Se chegou ao fim, exibe resultado
    if (currentQuestion >= quizQuestions.length) {
      displayResult();
    } else {
      displayQuestion();
    }
  }

  function displayResult() {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    let message = '';
    let emoji = '';
    
    if (percentage === 100) {
      message = `Perfeito! Você domina sistemas distribuídos!`;
      emoji = '🎉';
    } else if (percentage >= 80) {
      message = `Excelente! Conhecimento sólido em arquitetura.`;
      emoji = '🌟';
    } else if (percentage >= 60) {
      message = `Bom! Você tem noções importantes.`;
      emoji = '👍';
    } else {
      message = `Continue estudando!`;
      emoji = '📚';
    }

    $('#quiz-question').html(`${emoji} Resultado Final`);
    $('#quiz-options').empty();
    
    $('#quiz-result')
      .html(`
        <h4 style="color: #FFD700; margin-bottom: 20px; font-size: 1.3rem;">${message}</h4>
        
        <div style="background: rgba(255, 184, 77, 0.15); border: 2px solid #FFB84D; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 0.9rem; color: #FFB84D; margin: 5px 0; font-weight: 500;">PONTUAÇÃO</p>
          <div style="font-size: 2.5rem; font-weight: 700; color: #FFD700; margin: 10px 0;">
            ${score} / ${quizQuestions.length}
          </div>
          <p style="font-size: 1.3rem; color: #FFECB3; margin: 10px 0; font-weight: 600;">
            ${percentage}%
          </p>
        </div>
        
        <div style="margin-top: 15px;">
          <p style="color: #FFB84D; font-size: 0.9rem; margin-bottom: 8px; font-weight: 500;">Progresso</p>
          <div style="width: 100%; height: 25px; background: rgba(0,0,0,0.3); border-radius: 10px; overflow: hidden; border: 1px solid #FFB84D;">
            <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #FFB84D, #FFD700); transition: width 0.5s ease;"></div>
          </div>
        </div>
      `)
      .show();
    
    $('#quiz-feedback').hide();
    $('#quiz-next-btn').hide();
    $('#quiz-counter').hide();
    $('#quiz-restart-btn').show();
  }

  // Event listeners para quiz
  $(document).on('click', '#quiz-next-btn', nextQuestion);
  $(document).on('click', '#quiz-restart-btn', initQuiz);

  // Função pública para inicializar interações (chamada após HTML ser carregado)
  window.initializeInteractions = function() {
    if ($('#quiz-container').length > 0) {
      initQuiz();
    }
  };

  // Fallback: iniciar quiz se elemento já existir
  $(document).ready(function() {
    if ($('#quiz-container').length > 0 && $('#quiz-question').text() === '') {
      initQuiz();
    }
  });

  // ===== ARCHITECTURE - Tooltips Interativos =====
  $(document).on('mouseenter', '.arch-component', function() {
    const component = $(this).data('component');
    const title = $(this).attr('title');
    
    const tooltip = $('#component-tooltip');
    tooltip.find('#tooltip-text').text(title);
    
    const offset = $(this).offset();
    tooltip.css({
      top: (offset.top - 50) + 'px',
      left: (offset.left + $(this).width() / 2 - 50) + 'px'
    }).show();
  });

  $(document).on('mouseleave', '.arch-component', function() {
    $('#component-tooltip').hide();
  });

  // ===== SCROLL ANIMATION para seção de interações =====
  if ('IntersectionObserver' in window) {
    const interactionsObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          $(entry.target).addClass('animate-on-scroll fade-in-visible');
          interactionsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    $('.interactive-card, .quiz-container, .arch-box').each(function() {
      interactionsObserver.observe(this);
    });
  }

})(jQuery);
