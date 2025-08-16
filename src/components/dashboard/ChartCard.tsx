import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  icon: LucideIcon;
  type?: 'bar' | 'line' | 'pie';
  className?: string;
}

const ChartCard = ({ 
  title, 
  data, 
  icon: Icon, 
  type = 'bar',
  className = ''
}: ChartCardProps) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Prevent division by zero
  
  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="group">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
              />
              <span className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                {item.label}
              </span>
            </div>
            <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded-md">
              {item.value}
            </span>
          </div>
          <div className="relative bg-muted/30 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-2.5 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)`
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => {
    if (data.length === 0 || maxValue === 1) {
      return (
        <div className="relative h-32 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-base font-semibold">No Data</div>
            <div className="text-xs">No trends available</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative h-32">
        <svg className="w-full h-full" viewBox="0 0 300 140">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y, i) => (
            <line
              key={i}
              x1="10"
              y1={140 - (y / 100) * 120 + 10}
              x2="290"
              y2={140 - (y / 100) * 120 + 10}
              stroke="hsl(var(--muted))"
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
          
          {/* Area fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Area fill path */}
          <path
            fill="url(#areaGradient)"
            d={`M 10,${140 - (data[0]?.value / maxValue) * 120 + 10} ${data.map((item, index) => 
              `L ${(index / (data.length - 1)) * 280 + 10},${140 - (item.value / maxValue) * 120 + 10}`
            ).join(' ')} L ${(data.length - 1) / (data.length - 1) * 280 + 10},140 L 10,140 Z`}
          />
          
          {/* Main line */}
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
            points={data.map((item, index) => 
              `${(index / (data.length - 1)) * 280 + 10},${140 - (item.value / maxValue) * 120 + 10}`
            ).join(' ')}
          />
          
          {/* Data points */}
          {data.map((item, index) => (
            <g key={index}>
              {/* Glow effect */}
              <circle
                cx={(index / (data.length - 1)) * 280 + 10}
                cy={140 - (item.value / maxValue) * 120 + 10}
                r="6"
                fill="hsl(var(--primary))"
                opacity="0.2"
                className="animate-pulse"
              />
              {/* Main point */}
              <circle
                cx={(index / (data.length - 1)) * 280 + 10}
                cy={140 - (item.value / maxValue) * 120 + 10}
                r="4"
                fill="white"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                className="drop-shadow-sm hover:r-5 transition-all duration-200 cursor-pointer"
              />
            </g>
          ))}
        </svg>
        
                  {/* Enhanced labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs">
            {data.map((item, index) => (
              <div key={index} className="text-center group">
                <div className="bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm group-hover:bg-primary/10 transition-colors">
                  <div className="font-semibold text-primary text-xs">{item.value}</div>
                  <div className="text-muted-foreground text-xs">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="space-y-6">
        {/* Enhanced Pie Chart */}
        <div className="relative h-32 flex items-center justify-center">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            {/* Background circle for depth effect */}
            <circle cx="50" cy="50" r="40" fill="hsl(var(--muted))" opacity="0.1" />
            
            {total > 0 ? data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              currentAngle += angle;
              
              return (
                <g key={index}>
                  {/* Shadow effect */}
                  <path
                    d={`M 50 50 L ${x1 + 1} ${y1 + 1} A 40 40 0 ${largeArcFlag} 1 ${x2 + 1} ${y2 + 1} Z`}
                    fill="rgba(0,0,0,0.1)"
                  />
                  {/* Main slice */}
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={item.color || `hsl(${index * 60}, 70%, 60%)`}
                    className="hover:opacity-80 transition-all duration-300 cursor-pointer hover:scale-105"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                  {/* Highlight effect */}
                  <path
                    d={`M 50 50 L ${x1 * 0.8} ${y1 * 0.8} A 32 32 0 ${largeArcFlag} 1 ${x2 * 0.8} ${y2 * 0.8} Z`}
                    fill="rgba(255,255,255,0.3)"
                    className="pointer-events-none"
                  />
                </g>
              );
            }) : (
              // Show empty state when no data
              <g>
                <circle cx="50" cy="50" r="40" fill="hsl(var(--muted))" opacity="0.3" />
                <text x="50" y="55" textAnchor="middle" className="text-xs fill-muted-foreground">
                  No Data
                </text>
              </g>
            )}
          </svg>
          
          {/* Enhanced center content */}
          <div className="absolute text-center bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <div className="text-xl font-bold text-primary">{total}</div>
            <div className="text-xs text-muted-foreground font-medium">Total</div>
          </div>
        </div>
        
        {/* Enhanced Legend with Details */}
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={index} className="group flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
                      />
                      <div 
                        className="absolute inset-0 w-3 h-3 rounded-full opacity-30 animate-pulse" 
                        style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
                      />
                    </div>
                    <span className="font-semibold text-xs truncate group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded-md">
                      {item.value}
                    </span>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {percentage}%
                    </span>
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <Card className={`shadow-card hover:shadow-hover transition-all duration-500 ease-in-out animate-in fade-in-0 slide-in-from-bottom-2 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={`transition-all duration-500 ease-in-out ${type === 'pie' ? 'pb-3' : type === 'line' ? 'pb-4' : 'pb-3'}`}>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
