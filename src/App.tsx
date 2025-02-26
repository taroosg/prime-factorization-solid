// src/App.tsx
import { createSignal, createEffect, Show, For } from 'solid-js';
import { createStore } from 'solid-js/store';

// 素因数分解関数
function primeFactorize(num: number): number[] {
  // 入力値のバリデーション
  if (num < 2) return [];
  if (num > Number.MAX_SAFE_INTEGER) return [];

  const factors: number[] = [];
  let n = num;

  // 2で割れるだけ割る
  while (n % 2 === 0) {
    factors.push(2);
    n = n / 2;
  }

  // 3以上の奇数で試し割り
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    while (n % i === 0) {
      factors.push(i);
      n = n / i;
    }
  }

  // 最後に残った数が1より大きければ素数なので追加
  if (n > 1) {
    factors.push(n);
  }

  return factors;
}

// 素因数分解の結果を指数表記にまとめる関数
function groupFactors(factors: number[]): { prime: number; exponent: number }[] {
  const grouped: { prime: number; exponent: number }[] = [];

  if (factors.length === 0) return grouped;

  let currentPrime = factors[0];
  let exponent = 1;

  for (let i = 1; i < factors.length; i++) {
    if (factors[i] === currentPrime) {
      exponent++;
    } else {
      grouped.push({ prime: currentPrime, exponent });
      currentPrime = factors[i];
      exponent = 1;
    }
  }

  grouped.push({ prime: currentPrime, exponent });
  return grouped;
}

// アプリケーションのメインコンポーネント
const App = () => {
  const [inputValue, setInputValue] = createSignal<string>('');
  const [currentNumber, setCurrentNumber] = createSignal<number | null>(null);
  const [factors, setFactors] = createSignal<number[]>([]);
  const [groupedFactors, setGroupedFactors] = createSignal<{ prime: number; exponent: number }[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [calculationHistory, setCalculationHistory] = createStore<{ number: number; factorization: string }[]>([]);
  const [darkMode, setDarkMode] = createSignal<boolean>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // システムのカラースキーム変更を検知
  createEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  });

  // ダークモード切り替え
  const toggleDarkMode = () => {
    setDarkMode(!darkMode());
  };

  // 入力値の検証と素因数分解を実行
  const handleFactorize = () => {
    const num = parseInt(inputValue(), 10);
    setCurrentNumber(num);

    if (isNaN(num)) {
      setError('有効な数値を入力してください');
      setFactors([]);
      setGroupedFactors([]);
      return;
    }

    if (num < 2) {
      setError('2以上の整数を入力してください');
      setFactors([]);
      setGroupedFactors([]);
      return;
    }

    if (num > Number.MAX_SAFE_INTEGER) {
      setError('数値が大きすぎます');
      setFactors([]);
      setGroupedFactors([]);
      return;
    }

    setError(null);
    const factorsResult = primeFactorize(num);
    setFactors(factorsResult);

    const groupedResult = groupFactors(factorsResult);
    setGroupedFactors(groupedResult);

    // 計算履歴に追加
    const factorizationString = groupedResult
      .map(({ prime, exponent }) => exponent > 1 ? `${prime}^${exponent}` : `${prime}`)
      .join(' × ');

    setCalculationHistory(prev => [...prev, { number: num, factorization: factorizationString }]);
  };

  // 履歴から項目を削除
  const removeFromHistory = (index: number) => {
    setCalculationHistory(prev => prev.filter((_, i) => i !== index));
  };

  // 履歴から数値を再計算
  const recalculate = (num: number) => {
    setInputValue(num.toString());
    setCurrentNumber(num);
    const factorsResult = primeFactorize(num);
    setFactors(factorsResult);
    setGroupedFactors(groupFactors(factorsResult));
    setError(null);
  };

  // 入力フィールドをクリア
  const clearInput = () => {
    setInputValue('');
    setError(null);
  };

  return (
    <div class={`min-h-screen w-full ${darkMode() ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <div class="container mx-auto px-4 py-6 max-w-md">
        <header class={`flex justify-between items-center mb-6 p-4 border-b ${darkMode() ? 'border-gray-700' : 'border-gray-300'}`}>
          <h1 class="text-xl font-bold">素因数分解アプリ</h1>
          <button
            onClick={toggleDarkMode}
            class={`p-2 ${darkMode() ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
            aria-label={darkMode() ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            {darkMode() ?
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg> :
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>
        </header>

        <main class="flex flex-col space-y-4">
          <div class={`p-4 border ${darkMode() ? 'border-gray-700' : 'border-gray-300'}`}>
            <div class="space-y-3">
              <input
                type="number"
                value={inputValue()}
                onInput={(e) => setInputValue(e.currentTarget.value)}
                placeholder="2以上の整数を入力"
                class={`w-full p-2 border text-lg ${darkMode() ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
              />
              <div class="grid grid-cols-2 gap-3">
                <button
                  onClick={handleFactorize}
                  class={`p-2 border ${darkMode() ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
                >
                  計算
                </button>
                <button
                  onClick={clearInput}
                  class={`p-2 border ${darkMode() ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
                >
                  クリア
                </button>
              </div>
            </div>
          </div>

          <Show when={error()}>
            <div class={`p-4 border ${darkMode() ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'} text-center`}>
              {error()}
            </div>
          </Show>

          <Show when={currentNumber() !== null && factors().length > 0 && !error()}>
            <div class={`p-4 border ${darkMode() ? 'border-gray-700' : 'border-gray-300'}`}>
              <h2 class={`text-lg font-medium pb-2 mb-2 border-b ${darkMode() ? 'border-gray-700' : 'border-gray-300'}`}>
                {currentNumber()} の素因数分解:
              </h2>
              <p class={`p-2 my-2 ${darkMode() ? 'bg-gray-800' : 'bg-gray-100'} break-words`}>
                {currentNumber()} = {factors().join(' × ')}
              </p>
              <p class={`p-2 my-2 ${darkMode() ? 'bg-gray-800' : 'bg-gray-100'} break-words`}>
                {currentNumber()} = {
                  groupedFactors().map(({ prime, exponent }, index) => (
                    <>
                      {exponent > 1 ? `${prime}^${exponent}` : prime}
                      {index < groupedFactors().length - 1 ? ' × ' : ''}
                    </>
                  ))
                }
              </p>
            </div>
          </Show>

          <Show when={calculationHistory.length > 0}>
            <div class={`p-4 border ${darkMode() ? 'border-gray-700' : 'border-gray-300'}`}>
              <h2 class="text-lg font-medium mb-3">計算履歴</h2>
              <ul class="space-y-2">
                <For each={calculationHistory}>
                  {(item, index) => (
                    <li class={`flex justify-between items-center p-3 ${darkMode() ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <span
                        class="cursor-pointer overflow-hidden text-ellipsis"
                        onClick={() => recalculate(item.number)}
                      >
                        {item.number} = {item.factorization}
                      </span>
                      <button
                        onClick={() => removeFromHistory(index())}
                        class="hover:underline"
                        aria-label="履歴から削除"
                      >
                        削除
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Show>
        </main>

        <footer class={`mt-8 pt-4 text-center text-sm border-t ${darkMode() ? 'border-gray-700' : 'border-gray-300'}`}>
          © {new Date().getFullYear()} 素因数分解アプリ
        </footer>
      </div>
    </div>
  );
};

export default App;