    function loadSection(section) {
    const scrollToContainer = () => {
      const chartDiv = document.getElementById('chart-container');
      if (chartDiv) chartDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const container = document.getElementById('chart-container');
      switch (section) {
        case 'jobPostings':
          scrollToContainer();
          container.innerHTML = `
            <h3>📈 Monthly Job Postings Trend</h3>
            <div style="text-align: center; padding-bottom: 10px;">
  💡              <em> This interactive line chart displays the number of unique job postings across all months from 2020 to 2025.</em>
              </div>
            <label for="yearSelect">Select Year:</label>
            <select id="yearSelect" onchange="updateJobChartByYear()"></select>
            <canvas id="jobPostingsChart"></canvas>
          `;
          loadJobPostingsChart();
          break;
        case 'completions':
            scrollToContainer();
            container.innerHTML = `
              <h3>🎓 Completions vs Job Demand</h3>
              <div style="text-align: center; padding-bottom: 10px;">
  💡              <em>This chart highlights institutions producing the highest number of graduates in 2022. Compare this with job market demand to identify talent pipelines and potential gaps.</em>
              </div>
              <label for="metricSelect">Select Metric:</label>
              <select id="metricSelect" onchange="loadCompletionsChart()"></select>
              <canvas id="completionsChart"></canvas>
            `;
            loadCompletionsChart();
            break;
        case 'skills':
            scrollToContainer();
            container.innerHTML = `
              <h3>🛠️ Top Specialized Skills</h3>
              <div style="text-align: center; padding-bottom: 10px;">
  💡              <em> This chart highlights the most in-demand specialized skills based on job postings, profiles, and projected growth. It helps identify which technical or soft skills are currently valued by employers and where future skill development may be needed.</em>
              </div>
              <label for="skillMetricSelect">Select Metric:</label>
              <select id="skillMetricSelect" onchange="loadTopSkillsChart()"></select>
              <canvas id="skillsChart"></canvas>
            `;
            loadTopSkillsChart();
            break;

        case 'employers':
            scrollToContainer();
            container.innerHTML = `
              <h3>🏢 Top Hiring Employers</h3>
              <div style="text-align: center; padding-bottom: 10px;">
  💡              <em>This pie chart highlights the leading employers by reported hires and job postings, revealing which companies dominate the local job market.</em>
              </div>
              <label for="employerMetricSelect">Select Metric:</label>
              <select id="employerMetricSelect" onchange="loadTopEmployersChart()"></select>
              <canvas id="employersChart"></canvas>
            `;
            loadTopEmployersChart();
            break;


        case 'regions':
            scrollToContainer();
            container.innerHTML = `
              <h3>🗺️ Regional Job Postings Distribution</h3>
              <div style="text-align: center; padding-bottom: 10px;">
  💡              <em>This chart provides a regional breakdown of workforce activity, highlighting key metrics like job postings, salaries, and demand across top counties.</em>
              </div>
              <label for="regionMetricSelect">Select Metric:</label>
              <select id="regionMetricSelect" onchange="loadRegionalInsightsChart()"></select>
              <canvas id="regionsChart"></canvas>
            `;
            loadRegionalInsightsChart();
            break;

          break;
        case 'salary':
          scrollToContainer();
          container.innerHTML = `
            <h3>💰 Salary & Duration Insights by County</h3>
            <label for="salaryMetricSelect">Select Metric:</label>
            <select id="salaryMetricSelect" onchange="loadSalaryChart()"></select>
            <canvas id="salaryChart"></canvas>
          `;
          loadSalaryChart();
          break;

        case 'story':
          scrollToContainer();
          container.innerHTML = `
            <h3>📈 Storytelling Insightsfff</h3>
            <p>Implemented multiple charts here based on insights from all datasets.</p>
            <div id="storyChartContainer" style="max-width: 900px; margin: auto;">
              <canvas id="storyChart1"></canvas>
            </div>
          `;
          loadCompletionsVsJobOpenings();
          break;

      }
    }

    let jobPostingsData = [];
let chartInstance;

function loadJobPostingsChart() {
  fetch('data/Job_Postings_Timeseries.csv')
    .then(response => response.text())
    .then(data => {
      console.log('Raw CSV:', data);
      const rows = data.split('\n').filter(row => row.trim() !== '').slice(1);
      
      console.log('Parsed Rows:', rows);
      console.log('Job Postings Data:', jobPostingsData);

      jobPostingsData = rows.map(row => {
        const [month, postings] = row.split(',');
        const parts = month.trim().split(' ');
        const year = parts.length > 1 ? parts[1] : '';

        return { month, year, postings: +postings };
      });

      populateYearDropdown();
      updateJobChartByYear();
    });
}

function populateYearDropdown() {
  const yearSelect = document.getElementById('yearSelect');
  const years = [...new Set(jobPostingsData.map(d => d.year).filter(Boolean))].sort();
  yearSelect.innerHTML = '<option value="All">All</option>';
  years.forEach(y => {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
  });
}

function updateJobChartByYear() {
  const selectedYear = document.getElementById('yearSelect').value;
  const filtered = jobPostingsData.filter(d => selectedYear === 'All' || d.year === selectedYear);

  const labels = filtered.map(d => d.month);
  const values = filtered.map(d => d.postings);

  const ctx = document.getElementById('jobPostingsChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Unique Job Postings',
        data: values,
        borderColor: 'rgba(0, 91, 172, 1)',
        backgroundColor: 'rgba(0, 91, 172, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: context => ` ${context.parsed.y.toLocaleString()} postings`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Month' }
        },
        y: {
          title: { display: true, text: 'Unique Job Postings' }
        }
      }
    }
  });
}
  // 📊 Load and display completions vs job demand bar chart
function loadCompletionsChart() {
  fetch('data/Completions_by_Institution.csv')
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n').filter(row => row.trim() !== '');
      const headers = rows[0].split(',');
      const institutions = [];
      const dataSets = {};

      // Initialize datasets from headers
      headers.slice(1).forEach(h => dataSets[h] = []);

      // Parse each row of data
      rows.slice(1).forEach(row => {
        const cols = row.split(',');
        institutions.push(cols[0]);
        headers.slice(1).forEach((h, i) => {
          const value = parseFloat(cols[i + 1]);
          dataSets[h].push(isNaN(value) ? 0 : value);
        });
      });

      // Populate metric dropdown dynamically
      const metricSelect = document.getElementById('metricSelect');
      if (metricSelect && metricSelect.options.length === 0) {
        headers.slice(1).forEach(h => {
          const option = document.createElement('option');
          option.value = h;
          option.text = h;
          metricSelect.appendChild(option);
        });
      }

      const selectedMetric = document.getElementById('metricSelect').value || headers[1];

      const ctx = document.getElementById('completionsChart').getContext('2d');
      if (window.completionsChartInstance) window.completionsChartInstance.destroy();

      window.completionsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: institutions.slice(0, 10),
          datasets: [{
            label: selectedMetric,
            data: dataSets[selectedMetric].slice(0, 10),
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: selectedMetric }
            },
            y: {
              title: { display: true, text: 'Institution' }
            }
          }
        }
      });
    });
}
function loadTopSkillsChart() {
  fetch('data/Top_Specialized_Skills.csv')
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n').filter(row => row.trim() !== '').slice(1);
      const skillData = rows.map(row => {
        const cols = row.split(',');
        return {
          skill: cols[0]?.trim(),
          postings: +cols[1],
          profiles: +cols[3],
          growth: parseFloat(cols[5]),
          category: cols[6]?.trim()
        };
      });

      const metricOptions = ['postings', 'profiles', 'growth'];
      const metricLabels = {
        postings: 'Job Postings',
        profiles: 'Profiles',
        growth: 'Projected Skill Growth'
      };

      const dropdown = document.getElementById('skillMetricSelect');
      if (dropdown && dropdown.options.length === 0) {
        metricOptions.forEach(metric => {
          const option = document.createElement('option');
          option.value = metric;
          option.text = metricLabels[metric];
          dropdown.appendChild(option);
        });
      }

      const selectedMetric = dropdown?.value || 'postings';
      const sortedSkills = skillData
        .sort((a, b) => b[selectedMetric] - a[selectedMetric])
        .slice(0, 10);

      const labels = sortedSkills.map(d => d.skill);
      const values = sortedSkills.map(d => d[selectedMetric]);
      const backgroundColors = sortedSkills.map(d => {
        switch (d.category) {
          case 'Rapidly Growing': return 'rgba(40, 167, 69, 0.7)';
          case 'Stable': return 'rgba(108, 117, 125, 0.7)';
          case 'Growing': return 'rgba(255, 193, 7, 0.7)';
          default: return 'rgba(0, 123, 255, 0.7)';
        }
      });

      const ctx = document.getElementById('skillsChart').getContext('2d');
      if (window.skillsChartInstance) window.skillsChartInstance.destroy();

      window.skillsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: metricLabels[selectedMetric],
            data: values,
            backgroundColor: backgroundColors
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.parsed.x.toLocaleString()}`
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              title: { display: true, text: metricLabels[selectedMetric] }
            },
            y: {
              title: { display: true, text: 'Skill' }
            }
          }
        }
      });
    });
}
function loadTopEmployersChart() {
  fetch('data/Job_Postings_Top_Companies.csv')
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n').filter(row => row.trim() !== '').slice(1);
      const employerData = rows.map(row => {
        const [employer, postings, hires] = row.split(',');
        return {
          employer: employer.trim(),
          postings: +postings,
          hires: +hires || 0
        };
      });

      const metricOptions = ['postings', 'hires'];
      const metricLabels = {
        postings: 'Job Postings',
        hires: 'Reported Hires'
      };

      const dropdown = document.getElementById('employerMetricSelect');
      if (dropdown && dropdown.options.length === 0) {
        metricOptions.forEach(metric => {
          const option = document.createElement('option');
          option.value = metric;
          option.text = metricLabels[metric];
          dropdown.appendChild(option);
        });
      }

      const selectedMetric = dropdown?.value || 'postings';
      const top10 = employerData.sort((a, b) => b[selectedMetric] - a[selectedMetric]).slice(0, 10);
      const labels = top10.map(d => d.employer);
      const values = top10.map(d => d[selectedMetric]);

      const ctx = document.getElementById('employersChart').getContext('2d');
      if (window.employersChartInstance) window.employersChartInstance.destroy();

      window.employersChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: metricLabels[selectedMetric],
            data: values,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
              '#9966FF', '#FF9F40', '#66D9E8', '#FA7268',
              '#8A6D3B', '#5BC0DE'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()}`
              }
            }
          }
        }
      });
    });
}

function loadRegionalInsightsChart() {
  fetch('data/Job_Postings_by_Location.csv')
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n').filter(row => row.trim() !== '').slice(1);
      const parsed = rows.map(row => {
        const cols = row.split(',');

        return {
          county: cols[1]?.replace(/"/g, '').trim(),
          duration: +cols[2],
          postings: +cols[3],
          salary: isNaN(parseFloat(cols[4])) ? 0 : +cols[4],
          concentration: +cols[5],
          profiles: +cols[6],
          avgUnique: +cols[7],
          postingIntensity: cols[8]?.trim()
        };
      });

      const metricOptions = ['postings', 'salary', 'concentration', 'profiles', 'avgUnique'];
      const metricLabels = {
        postings: 'Unique Postings',
        salary: 'Median Annual Advertised Salary',
        concentration: 'Posting Concentration',
        profiles: 'Online Profiles',
        avgUnique: 'Avg. Monthly Unique Postings'
      };

      const dropdown = document.getElementById('regionMetricSelect');
      if (dropdown && dropdown.options.length === 0) {
        metricOptions.forEach(metric => {
          const option = document.createElement('option');
          option.value = metric;
          option.text = metricLabels[metric];
          dropdown.appendChild(option);
        });
      }

      const selectedMetric = dropdown?.value || 'postings';
      const top10 = parsed.sort((a, b) => b[selectedMetric] - a[selectedMetric]).slice(0, 10);

      const labels = top10.map(d => d.county);
      const values = top10.map(d => d[selectedMetric]);

      const ctx = document.getElementById('regionsChart').getContext('2d');
      if (window.regionsChartInstance) window.regionsChartInstance.destroy();

      window.regionsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: metricLabels[selectedMetric],
            data: values,
            backgroundColor: 'rgba(153, 102, 255, 0.7)'
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: {
              title: { display: true, text: metricLabels[selectedMetric] }
            },
            y: {
              title: { display: true, text: 'County Name' }
            }
          }
        }
      });
    });
}

function loadSalaryChart() {
  fetch('data/Job_Postings_by_Location.csv')
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n').filter(row => row.trim() !== '').slice(1);
      const parsed = rows.map(row => {
        const cols = row.split(',');
        return {
          county: cols[1]?.trim(),
          duration: +cols[2],
          postings: +cols[3],
          salary: isNaN(parseFloat(cols[4])) ? 0 : +cols[4]
        };
      });

      const metricOptions = ['duration', 'postings', 'salary'];
      const metricLabels = {
        duration: 'Median Posting Duration (days)',
        postings: 'Unique Postings',
        salary: 'Median Annual Advertised Salary'
      };

      const dropdown = document.getElementById('salaryMetricSelect');
      if (dropdown && dropdown.options.length === 0) {
        metricOptions.forEach(metric => {
          const option = document.createElement('option');
          option.value = metric;
          option.text = metricLabels[metric];
          dropdown.appendChild(option);
        });
      }

      const selectedMetric = dropdown?.value || 'salary';
      const top10 = parsed.sort((a, b) => b[selectedMetric] - a[selectedMetric]).slice(0, 10);
      const labels = top10.map(d => d.county);
      const values = top10.map(d => d[selectedMetric]);

      const ctx = document.getElementById('salaryChart').getContext('2d');
      if (window.salaryChartInstance) window.salaryChartInstance.destroy();

      window.salaryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: metricLabels[selectedMetric],
            data: values,
            backgroundColor: 'rgba(255, 206, 86, 0.7)'
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: {
              title: { display: true, text: metricLabels[selectedMetric] }
            },
            y: {
              title: { display: true, text: 'County Name' }
            }
          }
        }
      });
    });
}

//###################################Custom Plots#####################################

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(s => s.trim());
}

function loadCompletionsVsJobOpenings() {
  fetch('data/Completions_by_Institution.csv')
    .then(r => r.text())
    .then(csv => {
      const rows = csv.trim().split('\n').slice(1);
      const allData = rows.map(line => {
        const cols = splitCSVLine(line);
        const school = cols[0].replace(/"/g, '').trim();
        const completions = parseInt(cols[1], 10);
        const marketShare = parseFloat(cols[3]);

        return {
          school,
          completions: isNaN(completions) ? 0 : completions,
          share: isNaN(marketShare) ? 0 : marketShare * 100
        };
      });

      const container = document.getElementById('storyChart1').parentElement;
      container.innerHTML = `
        
        <div style="margin-bottom: 1rem;">
        
          <label for="primaryPlotSelect">Choose a Storyline:</label>
          <select id="primaryPlotSelect">
            <option value="completions">Completions vs Job Market Share</option>
            <option value="skills">Top Skills in Demand</option>
            <option value="employers">Top Employers by Job Postings</option>
            <option value="regional">Regional Posting and Salary Insights</option>
            <option value="choropleth">Map (Salary & Job Postings by State)</option>
            <option value="salary">Salary Distribution by Region</option>
          </select>
        </div>
        <div id="dynamicChartContainer">
        
          <div style="margin-bottom: 1rem;">
             <label style="display: block; font-weight: bold; margin-bottom: 6px;">How many universities to compare?</label>
            <select id="numSelect">
              <option value="default" selected>-- Default View --</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div id="schoolSelects" style="text-align: center; padding-bottom: 10px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"></div>

          <div style="max-width: 900px; margin: 0 auto; overflow-x: auto; height: 450px;">
            <canvas id="storyChart1"></canvas>
          </div>
        </div>
      `;

      const numSelect = document.getElementById('numSelect');
      const selectsDiv = document.getElementById('schoolSelects');
      const primaryPlotSelect = document.getElementById('primaryPlotSelect');

      function updateChart(filteredData = null) {
        let filtered = [];

        if (filteredData) {
          filtered = filteredData;
        } else if (selectsDiv.querySelectorAll('select').length > 0) {
          const selectedSchools = [];
          selectsDiv.querySelectorAll('select').forEach(select => {
            if (select.value && !selectedSchools.includes(select.value)) {
              selectedSchools.push(select.value);
            }
          });
          filtered = allData.filter(d => selectedSchools.includes(d.school));
        } else {
          filtered = allData.slice(0, 10);
        }

        const ctx = document.getElementById('storyChart1').getContext('2d');
        if (window.storyChartInstance) window.storyChartInstance.destroy();

        window.storyChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: filtered.map(d => d.school),
            datasets: [
              {
                label: 'Completions (2022)',
                data: filtered.map(d => d.completions),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                yAxisID: 'y'
              },
              {
                label: 'Job Market Share (%)',
                data: filtered.map(d => d.share),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              tooltip: { mode: 'index', intersect: false }
            },
            scales: {
              y: {
                type: 'linear',
                position: 'left',
                beginAtZero: true,
                title: { display: true, text: 'Completions' },
                max: Math.max(...filtered.map(d => d.completions)) * 1.2
              },
              y1: {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Market Share (%)' },
                max: 100
              },
              x: {
                ticks: {
                  autoSkip: false,
                  maxRotation: 45,
                  minRotation: 0
                }
              }
            }
          }
        });
      }

      function createDropdowns(n) {
        selectsDiv.innerHTML = '';
        const selects = [];

        for (let i = 0; i < n; i++) {
          const select = document.createElement('select');
          select.id = `school${i}`;
          select.style.marginRight = '10px';

          allData.forEach(d => {
            const option = new Option(d.school, d.school);
            select.add(option);
          });

          select.selectedIndex = i;
          selectsDiv.appendChild(select);
          selects.push(select);
        }

        selects.forEach(sel => {
          sel.addEventListener('change', () => {
            const selectedSchools = selects.map(s => s.value);
            const filtered = allData.filter(d => selectedSchools.includes(d.school));
            updateChart(filtered);
          });
        });

        const selectedSchools = selects.map(s => s.value);
        const filtered = allData.filter(d => selectedSchools.includes(d.school));
        updateChart(filtered);
      }

      numSelect.addEventListener('change', () => {
        const value = numSelect.value;
        if (value === 'default') {
          selectsDiv.innerHTML = '';
          const top10 = allData.sort((a, b) => b.completions - a.completions).slice(0, 10);
          updateChart(top10);
        } else {
          createDropdowns(parseInt(value));
        }
      });

      primaryPlotSelect.addEventListener('change', () => {
        const plot = primaryPlotSelect.value;
        if (plot === 'completions') {
          loadSection('story')
        } else if (plot === 'skills') {
          document.getElementById('dynamicChartContainer').style.display = 'block';
          document.getElementById('dynamicChartContainer').innerHTML = '<canvas id="storyChart1"></canvas>';
          loadTopSkillsPlot();
        } else if (plot === 'employers') {
          document.getElementById('dynamicChartContainer').style.display = 'block';
          loadTopEmployersPlot();
        } else if (plot === 'regional') {
          document.getElementById('dynamicChartContainer').style.display = 'block';
          loadRegionalPlot();
        } else if (plot === 'choropleth') {
          document.getElementById('dynamicChartContainer').style.display = 'block';
          loadChoroplethMap();
        }else if (plot === 'salary') {
          document.getElementById('dynamicChartContainer').style.display = 'block';
          loadSalaryDistributionPlot();
        }else {
          document.getElementById('dynamicChartContainer').style.display = 'none';
          alert('This plot is under development!');
        }
      });

      const top10 = allData.sort((a, b) => b.completions - a.completions).slice(0, 10);
      updateChart(top10);
    });
}

function loadTopSkillsPlot() {
  fetch('data/Top_Specialized_Skills.csv')
    .then(r => r.text())
    .then(csv => {
      const rows = csv.trim().split('\n').slice(1);
      const allSkills = rows.map(line => {
        const cols = splitCSVLine(line);
        return {
          skill: cols[0],
          postings: +cols[1],
          profiles: +cols[3],
          growth: +cols[5],
          category: cols[6]
        };
      });

      const container = document.getElementById('dynamicChartContainer');
      container.innerHTML = `
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: bold; margin-bottom: 6px;">How many skills to compare?</label>
          <select id="skillCountSelect">
            <option value="default" selected>-- Default View --</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        <div id="skillSelects" style="text-align: center; padding-bottom: 10px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"></div>
        <div style="max-width: 900px; margin: 0 auto; overflow-x: auto; height: 450px;">
          <canvas id="storyChart1"></canvas>
        </div>
      `;

      const skillCountSelect = document.getElementById('skillCountSelect');
      const selectsDiv = document.getElementById('skillSelects');

      function updateChart(filtered) {
        const ctx = document.getElementById('storyChart1').getContext('2d');
        if (window.storyChartInstance) window.storyChartInstance.destroy();

        window.storyChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: filtered.map(s => s.skill),
            datasets: [
              {
                label: 'Job Postings',
                data: filtered.map(s => s.postings),
                backgroundColor: 'rgba(75, 192, 192, 0.7)'
              },
              {
                label: 'Profiles',
                data: filtered.map(s => s.profiles),
                backgroundColor: 'rgba(153, 102, 255, 0.6)'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Count'
                }
              },
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 0
                }
              }
            }
          }
        });
      }

      function createSkillDropdowns(n) {
        selectsDiv.innerHTML = '';
        const selects = [];

        for (let i = 0; i < n; i++) {
          const select = document.createElement('select');
          select.id = `skill${i}`;
          select.style.marginRight = '10px';

          allSkills.forEach(s => {
            const option = new Option(s.skill, s.skill);
            select.add(option);
          });

          select.selectedIndex = i;
          selectsDiv.appendChild(select);
          selects.push(select);
        }

        function refreshChart() {
          const selected = selects.map(s => s.value);
          const unique = [...new Set(selected)];
          const filtered = allSkills.filter(s => unique.includes(s.skill));
          updateChart(filtered);
        }

        selects.forEach(sel => sel.addEventListener('change', refreshChart));
        refreshChart();
      }

      skillCountSelect.addEventListener('change', () => {
        const value = skillCountSelect.value;
        if (value === 'default') {
          selectsDiv.innerHTML = '';
          updateChart(allSkills.slice(0, 10));
        } else {
          createSkillDropdowns(parseInt(value));
        }
      });

      skillCountSelect.value = 'default'; // reset to default
      updateChart(allSkills.slice(0, 10));
    });
}

function loadTopEmployersPlot(selectedCompanies = null) {
  Promise.all([
    fetch('data/Job_Postings_Top_Companies.csv').then(r => r.text()),
    fetch('data/Job_Postings_Timeseries.csv').then(r => r.text())
  ]).then(([companiesCsv, timeseriesCsv]) => {
    const companyRows = companiesCsv.trim().split('\n');
    const timeRows = timeseriesCsv.trim().split('\n');

    if (companyRows.length < 2 || timeRows.length < 2) {
      alert('Missing or invalid data in one or both CSVs.');
      return;
    }

    const companies = companyRows.slice(1).map(line => {
      const cols = splitCSVLine(line);
      return {
        company: cols[0],
        postings: +cols[1],
        unique: +cols[2]
      };
    });

    const headers = splitCSVLine(timeRows[0]);
    const monthIndex = headers.findIndex(h => h.toLowerCase().includes('month'));
    const postingsIndex = headers.findIndex(h => h.toLowerCase().includes('unique postings'));

    const totalPostingsFromTimeSeries = timeRows.slice(1).reduce((sum, line) => {
      const cols = splitCSVLine(line);
      const month = cols[monthIndex];
      if (month && (month.includes('2022') || month.includes('2023'))) {
        sum += +cols[postingsIndex];
      }
      return sum;
    }, 0);

    const topCompanies = selectedCompanies ?
      companies.filter(c => selectedCompanies.includes(c.company)) :
      companies.sort((a, b) => b.postings - a.postings).slice(0, 10);

    const container = document.getElementById('dynamicChartContainer');
    container.innerHTML = `
      <div style="text-align: center; font-weight: bold; padding: 10px;">
        Total Job Postings (2022–2023): ${totalPostingsFromTimeSeries.toLocaleString()}
      </div>
      <div style="text-align: center; padding-bottom: 10px;">
        <label style="display: block; font-weight: bold; margin-bottom: 6px;">Compare companies:</label>
        <select id="employerNumSelect">
          <option value="default">-- Default View --</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
      <div id="employerDropdowns" style="text-align: center; padding-bottom: 10px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"></div>
      <div style="max-width: 900px; margin: 0 auto; overflow-x: auto; height: 450px;">
        <canvas id="storyChart1"></canvas>
      </div>
    `;

    function renderChart(dataSet) {
      const ctx = document.getElementById('storyChart1').getContext('2d');
      if (window.storyChartInstance) window.storyChartInstance.destroy();

      window.storyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dataSet.map(e => e.company),
          datasets: [
            {
              label: 'Total Postings',
              data: dataSet.map(e => e.unique),
              backgroundColor: 'rgba(255, 159, 64, 0.7)'
            },
            {
              label: 'Market Share (%)',
              data: dataSet.map(e => ((e.unique / totalPostingsFromTimeSeries) * 100)),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Postings Count'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              title: {
                display: true,
                text: 'Market Share (%)'
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 0
              }
            }
          }
        }
      });
    }

    renderChart(topCompanies);

    const employerNumSelect = document.getElementById('employerNumSelect');
    const employerDropdownsDiv = document.getElementById('employerDropdowns');

    employerNumSelect.addEventListener('change', () => {
      const count = +employerNumSelect.value;
      employerDropdownsDiv.innerHTML = '';
      if (count && count >= 2 && count <= 4) {
        const dropdowns = [];
        for (let i = 0; i < count; i++) {
          const select = document.createElement('select');
          select.innerHTML = companies.map(c => `<option value="${c.company}">${c.company}</option>`).join('');
          dropdowns.push(select);
          employerDropdownsDiv.appendChild(select);
        }

        function refresh() {
          const selected = dropdowns.map(d => d.value);
          const unique = [...new Set(selected)];
          const filtered = companies.filter(c => unique.includes(c.company));
          renderChart(filtered);
        }

        dropdowns.forEach(d => d.addEventListener('change', refresh));
        refresh();
      } else {
        renderChart(topCompanies);
      }
    });
  }).catch(error => {
    console.error('Failed to load Top Employers plot:', error);
    alert('Error loading Top Employers data. Check console for details.');
  });
}

function loadRegionalPlot(selectedStates = null) {
  fetch('data/Job_Postings_by_Location.csv')
    .then(r => r.text())
    .then(csv => {
      const rows = csv.trim().split('\n').slice(1);
      const allData = rows.map(row => {
        const cols = splitCSVLine(row);
        return {
          state: cols[1],
          postings: +cols[3],
          salary: isNaN(+cols[4]) ? 0 : +cols[4]
        };
      });

      const filteredData = selectedStates ?
        allData.filter(d => selectedStates.includes(d.state)) :
        allData.sort((a, b) => b.postings - a.postings).slice(0, 10);

        const container = document.getElementById('dynamicChartContainer');
        container.innerHTML = `
          <div style="text-align: center; padding-bottom: 10px;">
            <label style="display: block; font-weight: bold; margin-bottom: 6px;">Compare regions:</label>
          </div>
          <div style="text-align: center; padding-bottom: 10px;">
            <select id="regionNumSelect">
              <option value="default">-- Default View --</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div id="regionDropdowns" style="text-align: center; padding-bottom: 10px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"></div>
          <div style="max-width: 900px; margin: 0 auto; overflow-x: auto; height: 450px;">
            <canvas id="storyChart1"></canvas>
          </div>
        `;



      const ctx = document.getElementById('storyChart1').getContext('2d');
      if (window.storyChartInstance) window.storyChartInstance.destroy();

      window.storyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: filteredData.map(d => d.state),
          datasets: [
            {
              label: 'Job Postings',
              data: filteredData.map(d => d.postings),
              backgroundColor: 'rgba(255, 206, 86, 0.7)'
            },
            {
              label: 'Avg Salary ($)',
              data: filteredData.map(d => d.salary),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Postings Count'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              title: {
                display: true,
                text: 'Average Salary ($)'
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 0
              }
            }
          }
        }
      });

      const regionNumSelect = document.getElementById('regionNumSelect');
      const regionDropdownsDiv = document.getElementById('regionDropdowns');

      regionNumSelect.addEventListener('change', () => {
        const count = +regionNumSelect.value;
        regionDropdownsDiv.innerHTML = '';
        if (count && count >= 2 && count <= 4) {
          const dropdowns = [];
          for (let i = 0; i < count; i++) {
            const select = document.createElement('select');
            select.innerHTML = allData.map(d => `<option value="${d.state}">${d.state}</option>`).join('');
            dropdowns.push(select);
            regionDropdownsDiv.appendChild(select);
          }

          function refresh() {
            const selected = dropdowns.map(d => d.value);
            const unique = [...new Set(selected)];
            const filtered = allData.filter(d => unique.includes(d.state));
            if (window.storyChartInstance) window.storyChartInstance.destroy();
            window.storyChartInstance = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: filtered.map(d => d.state),
                datasets: [
                  {
                    label: 'Job Postings',
                    data: filtered.map(d => d.postings),
                    backgroundColor: 'rgba(255, 206, 86, 0.7)'
                  },
                  {
                    label: 'Avg Salary ($)',
                    data: filtered.map(d => d.salary),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    yAxisID: 'y1'
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Postings Count'
                    }
                  },
                  y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: {
                      display: true,
                      text: 'Average Salary ($)'
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 0
                    }
                  }
                }
              }
            });
          }

          dropdowns.forEach(d => d.addEventListener('change', refresh));
          refresh();
        } else {
          if (window.storyChartInstance) window.storyChartInstance.destroy();
          window.storyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: filteredData.map(d => d.state),
              datasets: [
                {
                  label: 'Job Postings',
                  data: filteredData.map(d => d.postings),
                  backgroundColor: 'rgba(255, 206, 86, 0.7)'
                },
                {
                  label: 'Avg Salary ($)',
                  data: filteredData.map(d => d.salary),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                  yAxisID: 'y1'
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Postings Count'
                  }
                },
                y1: {
                  beginAtZero: true,
                  position: 'right',
                  grid: { drawOnChartArea: false },
                  title: {
                    display: true,
                    text: 'Average Salary ($)'
                  }
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 0
                  }
                }
              }
            }
          });
        }
      });
    });
}

function loadChoroplethMap() {
  const container = document.getElementById('dynamicChartContainer');
  container.innerHTML = `
    <div style="text-align: center; font-weight: bold; padding: 10px;">
      This map visualizes job posting densities and the Median salary across US counties. Darker regions indicate higher job demand (Please click on the map to see the number).
    </div>
    <div id="map" style="height: 600px; max-width: 1000px; margin: 0 auto;"></div>
  `;

  const map = L.map('map').setView([37.8, -96], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  Promise.all([
    fetch('data/Job_Postings_by_Location.csv').then(r => r.text()),
    fetch('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json').then(r => r.json())
  ]).then(([csv, geojson]) => {
    const rows = csv.trim().split('\n').slice(1);
    const dataMap = {};
    const nameMap = {};
    const salaryMap = {};

    rows.forEach(row => {
      const cols = splitCSVLine(row);
      const fips = cols[0].padStart(5, '0');  // Pad to 5-digit FIPS
      const postings = +cols[3]; // Assuming 'Unique Postings' is in column index 3
      dataMap[fips] = postings;
      const countyName = cols[1];
      nameMap[fips] = countyName;
      const medianSalary = cols[4];
      salaryMap[fips] = medianSalary
    });

    function getColor(d) {
      return d > 200 ? '#800026' :
             d > 100 ? '#BD0026' :
             d > 50  ? '#E31A1C' :
             d > 20  ? '#FC4E2A' :
             d > 10  ? '#FD8D3C' :
             d > 5   ? '#FEB24C' :
             d > 1   ? '#FED976' :
                      '#FFEDA0';
    }

    function style(feature) {
      const fips = feature.id;
      const postings = dataMap[fips] || 0;
      return {
        fillColor: getColor(postings),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '1',
        fillOpacity: 0.7
      };
    }

    function onEachFeature(feature, layer) {
      const fips = feature.id;
      const postings = dataMap[fips] || 0;
      const countyName = nameMap[fips] || 0;
      const medianSalary = salaryMap[fips] || 0;
      layer.bindPopup(`<strong>County Name: ${countyName}</strong><br>Median Salary: ${medianSalary}<br>Postings: ${postings.toLocaleString()}`);
    }

    L.geoJson(geojson, {
      style,
      onEachFeature
    }).addTo(map);
  });
}

function loadSalaryDistributionPlot() {
  fetch('data/Job_Postings_by_Location.csv')
    .then(r => r.text())
    .then(csv => {
      const rows = csv.trim().split('\n').slice(1);
      const salaryData = [];

      rows.forEach(row => {
        const cols = splitCSVLine(row);
        const countyName = cols[1];
        const salary = cols[4] !== 'Insf. Data' ? +cols[4] : null;
        if (salary && !isNaN(salary)) {
          salaryData.push({ countyName, salary });
        }
      });

      salaryData.sort((a, b) => b.salary - a.salary);
      const top10 = salaryData.slice(0, 10);

      const container = document.getElementById('dynamicChartContainer');
      container.innerHTML = `
        <div style="text-align: center; font-weight: bold; padding: 10px;">
          Top 10 Regions by Median Annual Advertised Salary
        </div>
        <div style="text-align: center; padding-bottom: 10px;">
          This chart displays the highest-paying regions based on median salary data.
        </div>
        <div style="max-width: 900px; margin: 0 auto; overflow-x: auto; height: 450px; padding-right: 20px;">
          <canvas id="storyChart1"></canvas>
        </div>
      `;

      const ctx = document.getElementById('storyChart1').getContext('2d');
      if (window.storyChartInstance) window.storyChartInstance.destroy();

      window.storyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top10.map(d => d.countyName),
          datasets: [
            {
              label: 'Median Salary (USD)',
              data: top10.map(d => d.salary),
              backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Salary (USD)'
              }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 0
              }
            }
          }
        }
      });
    });
}