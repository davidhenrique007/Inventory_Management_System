import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #lineCanvas></canvas>
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
export class LineChartComponent implements OnInit, AfterViewInit {
  @Input() datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string }[] = [];
  @Input() labels: string[] = [];
  @Input() title: string = '';

  @ViewChild('lineCanvas') private canvasRef!: ElementRef;
  private chart: Chart | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    if (!this.canvasRef?.nativeElement || !this.datasets.length) return;

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.borderColor,
          backgroundColor: ds.backgroundColor,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: ds.borderColor,
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
          tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}
