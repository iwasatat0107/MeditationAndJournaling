import { render, screen } from '@testing-library/react';
import { CircularProgress } from '../CircularProgress';

describe('CircularProgress', () => {
  describe('進捗率の表示', () => {
    it('0% の進捗率が正しく表示される', () => {
      render(<CircularProgress progress={0} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });

    it('50% の進捗率が正しく表示される', () => {
      render(<CircularProgress progress={50} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });

    it('100% の進捗率が正しく表示される', () => {
      render(<CircularProgress progress={100} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });

    it('100% を超える進捗率は 100% にクランプされる', () => {
      render(<CircularProgress progress={150} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });

    it('0% 未満の進捗率は 0% にクランプされる', () => {
      render(<CircularProgress progress={-10} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('variant による色分け', () => {
    it('meditation variant は meditation カラークラスを使用する', () => {
      render(<CircularProgress progress={50} variant="meditation" />);
      const progressIndicator = screen.getByTestId('progress-indicator');
      expect(progressIndicator).toHaveClass('stroke-meditation-600', 'dark:stroke-meditation-500');
    });

    it('journaling variant は journaling カラークラスを使用する', () => {
      render(<CircularProgress progress={50} variant="journaling" />);
      const progressIndicator = screen.getByTestId('progress-indicator');
      expect(progressIndicator).toHaveClass('stroke-journaling-600', 'dark:stroke-journaling-500');
    });

    it('デフォルトの variant は meditation である', () => {
      render(<CircularProgress progress={50} />);
      const progressIndicator = screen.getByTestId('progress-indicator');
      expect(progressIndicator).toHaveClass('stroke-meditation-600', 'dark:stroke-meditation-500');
    });
  });

  describe('アクセシビリティ属性', () => {
    it('role="progressbar" が設定されている', () => {
      render(<CircularProgress progress={50} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('aria-valuenow が正しく設定されている', () => {
      render(<CircularProgress progress={75} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    });

    it('aria-valuemin が 0 に設定されている', () => {
      render(<CircularProgress progress={50} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    });

    it('aria-valuemax が 100 に設定されている', () => {
      render(<CircularProgress progress={50} variant="meditation" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('children の表示', () => {
    it('children が正しくレンダリングされる', () => {
      render(
        <CircularProgress progress={50} variant="meditation">
          <span>カスタムコンテンツ</span>
        </CircularProgress>
      );
      expect(screen.getByText('カスタムコンテンツ')).toBeInTheDocument();
    });

    it('showPercentage が true の場合、進捗率がパーセンテージで表示される', () => {
      render(<CircularProgress progress={75} variant="meditation" showPercentage />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('showPercentage が true で children がある場合、children が優先される', () => {
      render(
        <CircularProgress progress={50} variant="meditation" showPercentage>
          <span>カスタム</span>
        </CircularProgress>
      );
      expect(screen.getByText('カスタム')).toBeInTheDocument();
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
  });

  describe('SVG要素の存在', () => {
    it('svg 要素が存在する', () => {
      const { container } = render(<CircularProgress progress={50} variant="meditation" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('背景の circle 要素が存在する', () => {
      render(<CircularProgress progress={50} variant="meditation" />);
      const backgroundCircle = screen.getByTestId('progress-background');
      expect(backgroundCircle).toBeInTheDocument();
      expect(backgroundCircle.tagName).toBe('circle');
    });

    it('進捗表示の circle 要素が存在する', () => {
      render(<CircularProgress progress={50} variant="meditation" />);
      const progressIndicator = screen.getByTestId('progress-indicator');
      expect(progressIndicator).toBeInTheDocument();
      expect(progressIndicator.tagName).toBe('circle');
    });
  });

  describe('サイズとストローク幅のカスタマイズ', () => {
    it('size プロパティが正しく適用される', () => {
      const { container } = render(<CircularProgress progress={50} variant="meditation" size={100} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '100');
      expect(svg).toHaveAttribute('height', '100');
    });

    it('デフォルトの size は 200 である', () => {
      const { container } = render(<CircularProgress progress={50} variant="meditation" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '200');
    });

    it('strokeWidth プロパティが正しく適用される', () => {
      render(<CircularProgress progress={50} variant="meditation" strokeWidth={10} />);
      const progressIndicator = screen.getByTestId('progress-indicator');
      expect(progressIndicator).toHaveAttribute('stroke-width', '10');
    });
  });

  describe('className のカスタマイズ', () => {
    it('カスタム className が正しく適用される', () => {
      render(<CircularProgress progress={50} variant="meditation" className="custom-class" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('custom-class');
    });

    it('デフォルトの className が保持される', () => {
      render(<CircularProgress progress={50} variant="meditation" className="custom-class" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('relative', 'inline-flex', 'items-center', 'justify-center');
    });
  });
});
