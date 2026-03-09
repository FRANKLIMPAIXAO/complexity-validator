import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Client } from '@/types/database';
import { Employee, EmployeeMetrics, EmployeeFeedback, PERFORMANCE_LEVEL_CONFIG } from '@/types/employee';
import { EmployeeGoal, EmployeeCompetenceEvaluation, EmployeePDI } from '@/hooks/useEmployeeEvaluations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

const COMPLEXITY_LABELS: Record<string, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  alto_risco: 'Alto Risco',
  critico: 'Crítico',
};

const TAX_REGIME_LABELS: Record<string, string> = {
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
};

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  // Header background
  doc.setFillColor(15, 23, 42); // Dark blue
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 20, 30);

  // Date
  const dateText = `Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`;
  doc.text(dateText, doc.internal.pageSize.width - 20, 30, { align: 'right' });

  // Reset colors
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('CORTEXCONT - Sistema de Precificação Inteligente', 20, pageHeight - 10);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, 20, y);
  doc.setFont('helvetica', 'normal');
  return y + 10;
}

// Generate Client Analysis Report
export function generateClientReport(clients: Client[], companyName?: string): void {
  const doc = new jsPDF();
  const totalPages = 1; // Will be calculated after

  addHeader(doc, 'CORTEXCONT', companyName ? `Relatório de Clientes - ${companyName}` : 'Relatório de Análise de Clientes');

  let yPos = 55;

  // Summary Section
  yPos = addSectionTitle(doc, 'Resumo Executivo', yPos);

  const totalClients = clients.length;
  const underpricedCount = clients.filter(c => c.is_underpriced).length;
  const avgComplexity = clients.length > 0 
    ? Math.round(clients.reduce((sum, c) => sum + c.complexity_score, 0) / clients.length)
    : 0;
  const totalRevenue = clients.reduce((sum, c) => sum + Number(c.current_fee), 0);

  // Summary cards
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  const summaryData = [
    ['Total de Clientes', totalClients.toString()],
    ['Clientes Subprecificados', `${underpricedCount} (${totalClients > 0 ? Math.round((underpricedCount / totalClients) * 100) : 0}%)`],
    ['Complexidade Média', `${avgComplexity}/100`],
    ['Faturamento Mensal Total', `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indicador', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Complexity Distribution
  yPos = addSectionTitle(doc, 'Distribuição por Complexidade', yPos);

  const complexityGroups = clients.reduce((acc, client) => {
    acc[client.complexity_level] = (acc[client.complexity_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const complexityData = Object.entries(complexityGroups).map(([level, count]) => [
    COMPLEXITY_LABELS[level] || level,
    count.toString(),
    `${Math.round((count / totalClients) * 100)}%`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Nível de Complexidade', 'Quantidade', 'Percentual']],
    body: complexityData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Client List
  if (yPos > doc.internal.pageSize.height - 80) {
    doc.addPage();
    yPos = 20;
  }

  yPos = addSectionTitle(doc, 'Lista de Clientes', yPos);

  const clientData = clients.map(client => [
    client.name,
    TAX_REGIME_LABELS[client.tax_regime] || client.tax_regime,
    COMPLEXITY_LABELS[client.complexity_level] || client.complexity_level,
    `${client.complexity_score}/100`,
    `R$ ${Number(client.current_fee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    client.is_underpriced ? 'Sim' : 'Não',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Cliente', 'Regime', 'Complexidade', 'Score', 'Honorário', 'Subprecificado']],
    body: clientData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 50 },
      5: { halign: 'center' },
    },
    margin: { left: 20, right: 20 },
  });

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, i, pageCount);
  }

  doc.save(`relatorio-clientes-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Generate Employee Performance Report
export function generateEmployeeReport(
  employees: Employee[],
  metrics: EmployeeMetrics[],
  companyName?: string
): void {
  const doc = new jsPDF();

  addHeader(doc, 'CORTEXCONT', companyName ? `Relatório de Colaboradores - ${companyName}` : 'Relatório de Desempenho de Colaboradores');

  let yPos = 55;

  // Summary Section
  yPos = addSectionTitle(doc, 'Resumo Executivo', yPos);

  const totalEmployees = employees.length;
  const highPerformers = metrics.filter(m => m.performance_level === 'alto_desempenho').length;
  const atRisk = metrics.filter(m => m.performance_level === 'risco_operacional').length;
  const avgScore = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + (m.performance_score || 0), 0) / metrics.length)
    : 0;

  const summaryData = [
    ['Total de Colaboradores', totalEmployees.toString()],
    ['Alto Desempenho', `${highPerformers} (${totalEmployees > 0 ? Math.round((highPerformers / totalEmployees) * 100) : 0}%)`],
    ['Risco Operacional', `${atRisk} (${totalEmployees > 0 ? Math.round((atRisk / totalEmployees) * 100) : 0}%)`],
    ['Score Médio', `${avgScore}/100`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indicador', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Performance Distribution
  yPos = addSectionTitle(doc, 'Distribuição por Performance', yPos);

  const performanceGroups = metrics.reduce((acc, m) => {
    if (m.performance_level) {
      acc[m.performance_level] = (acc[m.performance_level] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const performanceData = Object.entries(performanceGroups).map(([level, count]) => [
    PERFORMANCE_LEVEL_CONFIG[level as keyof typeof PERFORMANCE_LEVEL_CONFIG]?.label || level,
    count.toString(),
    `${Math.round((count / metrics.length) * 100)}%`,
  ]);

  if (performanceData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Nível de Performance', 'Quantidade', 'Percentual']],
      body: performanceData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Employee List with Metrics
  if (yPos > doc.internal.pageSize.height - 80) {
    doc.addPage();
    yPos = 20;
  }

  yPos = addSectionTitle(doc, 'Detalhamento por Colaborador', yPos);

  const employeeData = employees.map(employee => {
    const employeeMetrics = metrics.find(m => m.employee_id === employee.id);
    const performanceLevel = employeeMetrics?.performance_level 
      ? PERFORMANCE_LEVEL_CONFIG[employeeMetrics.performance_level]?.label 
      : 'Sem avaliação';
    
    return [
      employee.name,
      employee.role,
      employee.department || '-',
      employeeMetrics?.performance_score?.toString() || '-',
      performanceLevel,
      employeeMetrics ? `${employeeMetrics.tasks_completed || 0}/${employeeMetrics.tasks_assigned || 0}` : '-',
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Colaborador', 'Cargo', 'Departamento', 'Score', 'Nível', 'Tarefas (C/A)']],
    body: employeeData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 40 },
    },
    margin: { left: 20, right: 20 },
  });

  // Individual Performance Details
  const employeesWithMetrics = employees.filter(e => metrics.some(m => m.employee_id === e.id));

  if (employeesWithMetrics.length > 0) {
    doc.addPage();
    yPos = 20;

    yPos = addSectionTitle(doc, 'Análise Individual Detalhada', yPos);

    employeesWithMetrics.forEach((employee, index) => {
      const employeeMetrics = metrics.find(m => m.employee_id === employee.id);
      if (!employeeMetrics) return;

      if (yPos > doc.internal.pageSize.height - 60) {
        doc.addPage();
        yPos = 20;
      }

      // Employee name
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${employee.name}`, 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 8;

      const detailData = [
        ['Score de Performance', `${employeeMetrics.performance_score || 0}/100`],
        ['Tarefas Atribuídas', employeeMetrics.tasks_assigned?.toString() || '0'],
        ['Tarefas Concluídas', employeeMetrics.tasks_completed?.toString() || '0'],
        ['Entregas no Prazo', employeeMetrics.tasks_on_time?.toString() || '0'],
        ['Retrabalhos', employeeMetrics.tasks_rework?.toString() || '0'],
        ['Obrigações Entregues', employeeMetrics.obligations_delivered?.toString() || '0'],
        ['Obrigações Atrasadas', employeeMetrics.obligations_delayed?.toString() || '0'],
        ['Erros em Obrigações', employeeMetrics.obligations_errors?.toString() || '0'],
      ];

      autoTable(doc, {
        startY: yPos,
        body: detailData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 40 },
        },
        margin: { left: 25, right: 20 },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    });
  }

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, i, pageCount);
  }

  doc.save(`relatorio-colaboradores-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Generate Complete Analysis Report
export function generateCompleteReport(
  clients: Client[],
  employees: Employee[],
  metrics: EmployeeMetrics[],
  companyName?: string
): void {
  const doc = new jsPDF();

  addHeader(doc, 'CORTEXCONT', companyName ? `Relatório Completo - ${companyName}` : 'Relatório de Análise Completa');

  let yPos = 55;

  // Executive Summary
  yPos = addSectionTitle(doc, 'Resumo Executivo Geral', yPos);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  const totalClients = clients.length;
  const underpricedCount = clients.filter(c => c.is_underpriced).length;
  const totalEmployees = employees.length;
  const highPerformers = metrics.filter(m => m.performance_level === 'alto_desempenho').length;
  const atRisk = metrics.filter(m => m.performance_level === 'risco_operacional').length;
  const totalRevenue = clients.reduce((sum, c) => sum + Number(c.current_fee), 0);

  const summaryData = [
    ['Clientes', totalClients.toString(), `${underpricedCount} subprecificados`],
    ['Colaboradores', totalEmployees.toString(), `${highPerformers} alto desempenho`],
    ['Alertas', (underpricedCount + atRisk).toString(), `${underpricedCount} clientes + ${atRisk} colaboradores`],
    ['Faturamento Mensal', `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Total de honorários'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Área', 'Total', 'Observação']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Alerts Section
  if (underpricedCount > 0 || atRisk > 0) {
    yPos = addSectionTitle(doc, 'Alertas e Recomendações', yPos);

    const alerts: string[][] = [];

    if (underpricedCount > 0) {
      const underpricedClients = clients.filter(c => c.is_underpriced);
      alerts.push(['⚠️ Clientes Subprecificados', underpricedClients.map(c => c.name).join(', ')]);
    }

    if (atRisk > 0) {
      const riskEmployees = employees.filter(e => {
        const m = metrics.find(m => m.employee_id === e.id);
        return m?.performance_level === 'risco_operacional';
      });
      alerts.push(['⚠️ Colaboradores em Risco', riskEmployees.map(e => e.name).join(', ')]);
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Tipo de Alerta', 'Detalhes']],
      body: alerts,
      theme: 'grid',
      headStyles: { fillColor: [220, 53, 69], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
      },
      margin: { left: 20, right: 20 },
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Top 10 Clients by Fee
  doc.addPage();
  yPos = 20;

  yPos = addSectionTitle(doc, 'Top 10 Clientes por Honorário', yPos);

  const topClients = [...clients]
    .sort((a, b) => Number(b.current_fee) - Number(a.current_fee))
    .slice(0, 10);

  const topClientsData = topClients.map((client, index) => [
    `${index + 1}º`,
    client.name,
    COMPLEXITY_LABELS[client.complexity_level] || client.complexity_level,
    `R$ ${Number(client.current_fee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Cliente', 'Complexidade', 'Honorário']],
    body: topClientsData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Top Performers
  yPos = addSectionTitle(doc, 'Colaboradores Destaque', yPos);

  const topPerformers = employees
    .map(e => {
      const m = metrics.find(m => m.employee_id === e.id);
      return { employee: e, score: m?.performance_score || 0, level: m?.performance_level };
    })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (topPerformers.length > 0) {
    const topPerformersData = topPerformers.map((item, index) => [
      `${index + 1}º`,
      item.employee.name,
      item.employee.role,
      `${item.score}/100`,
      PERFORMANCE_LEVEL_CONFIG[item.level as keyof typeof PERFORMANCE_LEVEL_CONFIG]?.label || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Colaborador', 'Cargo', 'Score', 'Nível']],
      body: topPerformersData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 },
    });
  } else {
    doc.setFontSize(10);
    doc.text('Nenhum colaborador com métricas registradas.', 20, yPos);
  }

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, i, pageCount);
  }

  doc.save(`relatorio-completo-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Generate Individual Employee Evaluation Report (all tools)
export function generateEmployeeEvaluationReport(
  employee: Employee,
  metrics: EmployeeMetrics | undefined,
  goals: EmployeeGoal[],
  evaluations: EmployeeCompetenceEvaluation[],
  feedback: EmployeeFeedback[],
  pdis: EmployeePDI[],
): void {
  const doc = new jsPDF();
  const config = metrics?.performance_level ? PERFORMANCE_LEVEL_CONFIG[metrics.performance_level] : null;

  addHeader(doc, 'CORTEXCONT', `Relatório de Avaliação - ${employee.name}`);

  let yPos = 55;

  // Employee Info
  yPos = addSectionTitle(doc, 'Dados do Colaborador', yPos);
  autoTable(doc, {
    startY: yPos,
    body: [
      ['Nome', employee.name],
      ['Cargo', employee.role],
      ['Departamento', employee.department || '-'],
      ['E-mail', employee.email || '-'],
      ['Data de Admissão', format(new Date(employee.hire_date), 'dd/MM/yyyy')],
      ['Performance', config ? `${metrics!.performance_score}/100 - ${config.label}` : 'Sem avaliação'],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
    margin: { left: 20, right: 20 },
  });
  yPos = doc.lastAutoTable.finalY + 15;

  // === SMART Goals ===
  if (goals.length > 0) {
    if (yPos > doc.internal.pageSize.height - 80) { doc.addPage(); yPos = 20; }
    yPos = addSectionTitle(doc, 'Metas SMART', yPos);

    const STATUS_LABELS: Record<string, string> = {
      pendente: 'Pendente', em_andamento: 'Em Andamento', concluida: 'Concluída', cancelada: 'Cancelada',
    };

    const goalsData = goals.map(g => {
      const smart = [g.is_specific ? 'S' : '', g.is_measurable ? 'M' : '', g.is_achievable ? 'A' : '', g.is_relevant ? 'R' : '', g.is_time_bound ? 'T' : ''].filter(Boolean).join('') || '-';
      const progress = g.target_value ? `${g.current_value || 0}/${g.target_value} ${g.unit || ''}` : '-';
      return [g.title, smart, progress, STATUS_LABELS[g.status] || g.status, g.deadline ? format(new Date(g.deadline), 'dd/MM/yyyy') : '-'];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Meta', 'SMART', 'Progresso', 'Status', 'Prazo']],
      body: goalsData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 55 } },
      margin: { left: 20, right: 20 },
    });
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // === Competence Evaluations ===
  if (evaluations.length > 0) {
    if (yPos > doc.internal.pageSize.height - 80) { doc.addPage(); yPos = 20; }
    yPos = addSectionTitle(doc, 'Avaliação de Competências (CHA)', yPos);

    const EVAL_TYPE_LABELS: Record<string, string> = {
      gestor: 'Gestor', autoavaliacao: 'Autoavaliação', par: 'Par', subordinado: 'Subordinado', cliente: 'Cliente',
    };

    const evalData = evaluations.map(e => [
      `${e.period_month}/${e.period_year}`,
      EVAL_TYPE_LABELS[e.evaluator_type] || e.evaluator_type,
      `${e.conhecimento_score}`, `${e.habilidade_score}`, `${e.atitude_score}`,
      `${e.responsabilidade}`, `${e.comunicacao}`, `${e.organizacao}`,
      `${e.proatividade}`, `${e.trabalho_equipe}`, `${e.lideranca}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Período', 'Avaliador', 'C', 'H', 'A', 'Resp', 'Com', 'Org', 'Pro', 'Eq', 'Lid']],
      body: evalData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 7, cellPadding: 2, halign: 'center' },
      columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' } },
      margin: { left: 20, right: 20 },
    });
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // === Structured Feedback ===
  if (feedback.length > 0) {
    if (yPos > doc.internal.pageSize.height - 80) { doc.addPage(); yPos = 20; }
    yPos = addSectionTitle(doc, 'Feedbacks Registrados', yPos);

    const FEEDBACK_LABELS: Record<string, string> = {
      cliente: 'Cliente', gestor: 'Gestor', autoavaliacao: 'Autoavaliação',
    };

    const feedbackData = feedback.map(f => [
      format(new Date(f.created_at), 'dd/MM/yyyy'),
      FEEDBACK_LABELS[f.feedback_type] || f.feedback_type,
      `${f.rating}/5`,
      f.comment || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Tipo', 'Nota', 'Comentário']],
      body: feedbackData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 3: { cellWidth: 80 } },
      margin: { left: 20, right: 20 },
    });
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // === PDI ===
  if (pdis.length > 0) {
    if (yPos > doc.internal.pageSize.height - 80) { doc.addPage(); yPos = 20; }
    yPos = addSectionTitle(doc, 'Plano de Desenvolvimento Individual (PDI)', yPos);

    const PDI_STATUS: Record<string, string> = {
      pendente: 'Pendente', em_andamento: 'Em Andamento', concluido: 'Concluído',
    };

    const pdiData = pdis.map(p => [
      p.title,
      p.ponto_forte || '-',
      p.ponto_melhoria || '-',
      p.acao_pratica || '-',
      PDI_STATUS[p.status] || p.status,
      p.deadline ? format(new Date(p.deadline), 'dd/MM/yyyy') : '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Título', 'Ponto Forte', 'Melhoria', 'Ação Prática', 'Status', 'Prazo']],
      body: pdiData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      styles: { fontSize: 7, cellPadding: 2 },
      margin: { left: 20, right: 20 },
    });
  }

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, i, pageCount);
  }

  doc.save(`avaliacao-${employee.name.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
