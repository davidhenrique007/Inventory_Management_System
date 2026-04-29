import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #barCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class BarChartComponent implements OnInit, AfterViewInit {
  @Input() data: { label: string; value: number; color?: string }[] = [];
  @Input() title: string = '';
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';

  @ViewChild('barCanvas') private canvasRef!: ElementRef;
  private chart: Chart | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    if (!this.canvasRef?.nativeElement) return;

    const labels = this.data.map(item => item.label);
    const values = this.data.map(item => item.value);
    const backgroundColors = this.data.map(item => item.color || '#3b82f6');

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: this.title,
          data: values,
          backgroundColor: backgroundColors,
          borderRadius: 8,
          barPercentage: 0.65,
          categoryPercentage: 0.8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e2e8f0', lineWidth: 1 },
            title: { display: !!this.yAxisLabel, text: this.yAxisLabel, color: '#64748b' }
          },
          x: {
            grid: { display: false },
            title: { display: !!this.xAxisLabel, text: this.xAxisLabel, color: '#64748b' }
          }
        }
      }
    });
  }
}
