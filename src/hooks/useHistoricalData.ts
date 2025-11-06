import { useMemo } from 'react';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useBudgetStore } from '../store';

// Fake data generator pour la démo
const generateFakeData = (months: number, baseAmount: number) => {
  return Array.from({ length: months }, (_, i) => {
    const variance = Math.random() * 0.3 - 0.15;
    return baseAmount * (1 + variance);
  });
};

export const useHistoricalData = (selectedPeriod: 1 | 3 | 6, locale: string) => {
  const { expenses, incomes } = useBudgetStore();

  // Calculer les données historiques
  const historicalData = useMemo(() => {
    const data = [];
    const today = new Date();
    const useFakeData = expenses.length < 3;

    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const monthDate = subMonths(startOfMonth(today), i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      let monthExpenses = 0;
      let monthIncomes = 0;

      if (useFakeData) {
        const fakeExpenses = generateFakeData(selectedPeriod, 2500);
        const fakeIncomes = generateFakeData(selectedPeriod, 3500);
        monthExpenses = fakeExpenses[selectedPeriod - 1 - i];
        monthIncomes = fakeIncomes[selectedPeriod - 1 - i];
      } else {
        monthExpenses = expenses
          .filter((exp) =>
            isWithinInterval(new Date(exp.date), {
              start: monthStart,
              end: monthEnd,
            })
          )
          .reduce((sum, exp) => sum + exp.amount, 0);

        monthIncomes = incomes
          .filter((inc) =>
            isWithinInterval(new Date(inc.date), {
              start: monthStart,
              end: monthEnd,
            })
          )
          .reduce((sum, inc) => sum + inc.amount, 0);
      }

      data.push({
        month: format(monthDate, 'MMM', { locale: locale === 'fr' ? fr : enUS }),
        monthFull: format(monthDate, 'MMMM yyyy', { locale: locale === 'fr' ? fr : enUS }),
        monthKey,
        expenses: monthExpenses,
        income: monthIncomes,
        savings: monthIncomes - monthExpenses,
      });
    }

    return data;
  }, [selectedPeriod, expenses.length, incomes.length, locale]);

  // Calculer l'échelle globale pour éviter les jumps entre périodes
  const globalScale = useMemo(() => {
    const data = [];
    const today = new Date();
    const useFakeData = expenses.length < 3;

    // Calculer sur 6 mois pour avoir une échelle stable
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(startOfMonth(today), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      let monthExpenses = 0;
      let monthIncomes = 0;

      if (useFakeData) {
        const fakeExpenses = generateFakeData(6, 2500);
        const fakeIncomes = generateFakeData(6, 3500);
        monthExpenses = fakeExpenses[5 - i];
        monthIncomes = fakeIncomes[5 - i];
      } else {
        monthExpenses = expenses
          .filter((exp) =>
            isWithinInterval(new Date(exp.date), {
              start: monthStart,
              end: monthEnd,
            })
          )
          .reduce((sum, exp) => sum + exp.amount, 0);

        monthIncomes = incomes
          .filter((inc) =>
            isWithinInterval(new Date(inc.date), {
              start: monthStart,
              end: monthEnd,
            })
          )
          .reduce((sum, inc) => sum + inc.amount, 0);
      }

      data.push({
        expenses: monthExpenses,
        income: monthIncomes,
        savings: monthIncomes - monthExpenses,
      });
    }

    const allExpenses = data.map((d) => d.expenses);
    const allSavings = data.map((d) => d.savings);

    return {
      maxExpenses: Math.max(...allExpenses, 100),
      minExpenses: Math.min(...allExpenses, 0),
      maxSavings: Math.max(...allSavings, 100),
      minSavings: Math.min(...allSavings, 0),
    };
  }, [expenses.length, incomes.length]);

  return {
    historicalData,
    globalScale,
  };
};
