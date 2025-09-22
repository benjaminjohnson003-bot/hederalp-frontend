import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string | React.ReactNode;
  link?: {
    url: string;
    text: string;
  };
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  link,
  position = 'top',
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const tooltipSizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-t-8 border-x-transparent border-x-8',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-b-8 border-x-transparent border-x-8',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-l-8 border-y-transparent border-y-8',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-r-8 border-y-transparent border-y-8',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Help Icon */}
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} text-gray-400 hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full`}
        aria-label="Help information"
      >
        <HelpCircle className="w-full h-full" />
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div
          className={`absolute z-50 ${positionClasses[position]} ${tooltipSizeClasses[size]}`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-700">
            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white md:hidden"
              aria-label="Close help"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title */}
            <div className="font-semibold text-sm mb-2 pr-6 md:pr-0">
              {title}
            </div>

            {/* Content */}
            <div className="text-xs leading-relaxed text-gray-200">
              {typeof content === 'string' ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                content
              )}
            </div>

            {/* Link */}
            {link && (
              <div className="mt-3 pt-2 border-t border-gray-600">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-300 hover:text-blue-200 transition-colors"
                >
                  <span>{link.text}</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}

            {/* Arrow */}
            <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
};

// Pre-defined help content for common LP concepts
export const HELP_CONTENT = {
  impermanentLoss: {
    title: 'Impermanent Loss',
    content: `
      <p><strong>Impermanent Loss</strong> occurs when the price ratio of your deposited tokens changes compared to when you deposited them.</p>
      <br />
      <p><strong>Key Points:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>Only "realized" when you withdraw</li>
        <li>Higher with more price divergence</li>
        <li>Can be offset by trading fees</li>
        <li>More pronounced in wider price ranges</li>
      </ul>
    `,
    link: {
      url: 'https://docs.uniswap.org/concepts/protocol/fees#impermanent-loss',
      text: 'Learn more about Impermanent Loss'
    }
  },

  concentratedLiquidity: {
    title: 'Concentrated Liquidity',
    content: `
      <p><strong>Concentrated Liquidity</strong> allows you to provide liquidity within a specific price range, increasing capital efficiency.</p>
      <br />
      <p><strong>Benefits:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>Higher fee earnings when price is in range</li>
        <li>Better capital efficiency</li>
        <li>Customizable risk/reward profile</li>
      </ul>
      <br />
      <p><strong>Risks:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>No fees when price is out of range</li>
        <li>Requires more active management</li>
        <li>Higher impermanent loss risk</li>
      </ul>
    `,
    link: {
      url: 'https://docs.saucerswap.finance/',
      text: 'SaucerSwap Documentation'
    }
  },

  monteCarlo: {
    title: 'Monte Carlo Simulation',
    content: `
      <p><strong>Monte Carlo Simulation</strong> runs thousands of price scenarios using historical volatility to estimate probable outcomes.</p>
      <br />
      <p><strong>What it shows:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>Range of possible returns</li>
        <li>Probability of profit/loss</li>
        <li>Value at Risk (VaR) metrics</li>
        <li>Statistical confidence levels</li>
      </ul>
    `,
  },

  backtesting: {
    title: 'Historical Backtesting',
    content: `
      <p><strong>Backtesting</strong> simulates how your LP strategy would have performed using actual historical price data.</p>
      <br />
      <p><strong>Key Metrics:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>Win rate vs HODL strategy</li>
        <li>Range utilization efficiency</li>
        <li>Period-by-period performance</li>
        <li>Risk-adjusted returns</li>
      </ul>
    `,
  },

  capitalEfficiency: {
    title: 'Capital Efficiency',
    content: `
      <p><strong>Capital Efficiency</strong> measures how effectively your liquidity generates fees relative to the capital deployed.</p>
      <br />
      <p><strong>Factors:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>Range width (narrower = more efficient)</li>
        <li>Time in range (utilization rate)</li>
        <li>Market volatility</li>
        <li>Trading volume in your range</li>
      </ul>
    `,
  },

  aprCalculation: {
    title: 'APR Calculation',
    content: `
      <p><strong>APR (Annual Percentage Rate)</strong> estimates yearly returns based on current fee generation rates.</p>
      <br />
      <p><strong>Formula:</strong> (Daily Fees × 365) / Liquidity Amount</p>
      <br />
      <p><strong>Important:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>Based on current market conditions</li>
        <li>Does not account for impermanent loss</li>
        <li>Assumes constant fee generation</li>
        <li>Historical performance ≠ future results</li>
      </ul>
    `,
  },

  priceRange: {
    title: 'Price Range Selection',
    content: `
      <p><strong>Price Range</strong> determines where your liquidity is active and earning fees.</p>
      <br />
      <p><strong>Narrow Range:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>Higher fee APR when in range</li>
        <li>Higher risk of going out of range</li>
        <li>Requires more active management</li>
      </ul>
      <br />
      <p><strong>Wide Range:</strong></p>
      <ul class="list-disc list-inside space-y-1 mt-2">
        <li>More stable, less management needed</li>
        <li>Lower fee APR</li>
        <li>Better for passive strategies</li>
      </ul>
    `,
  },
};

export default HelpTooltip;

