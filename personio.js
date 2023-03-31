(function() {
  /**
   * Hacky script to display jobs on our website based on the personio API.
   * How to use:
   *  * Embed this script
   *  * Add a div with these attributes: `<div class="personio-jobs" data-department="Sales"></div>`
   *  * If `data-department` is null or non existing, all departments will be shown.
   */

  function renderPersonioJobs() {
    const groupBy = function(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };

    const PERSONIO_ROOT_URL = "https://neo-commerce-gmbh.jobs.personio.de";
    const PERSONIO_SEARCH_URL = `${PERSONIO_ROOT_URL}/search.json`;
    const rootElementName = "personio-jobs";
    const rootElements = document.querySelectorAll(`.${rootElementName}`);

    if (rootElements.length) {
      fetch(PERSONIO_SEARCH_URL).then(function(response) {
        return response.json()
      }).then(function(jobs) {
        rootElements.forEach(function(rootElement) {
          const department = rootElement.getAttribute("data-department");
          const filteredJobs = jobs.filter(function(job) {
            return department === null || job.department === department;
          });
          rootElement.innerHTML = renderJobs(rootElement, filteredJobs);
        });
      });
    }

    function renderJobs(jobs) {
      const styles = `
        .${rootElementName} a {
          background: white;
          padding: 15px 8px;
          color: #4b5768;
          display: flex;
          text-decoration: none;
          justify-content: space-between;
          align-items: center;
        }

        .${rootElementName} a:hover {
          background: #e8f4ff;
        }

        .${rootElementName} a:not(:last-child) {
          border-bottom: 2px solid #eeeff1;
        }


        .${rootElementName} a > b {
          font-size: 110%;
        }

        .${rootElementName}__position__info {
          text-align: right;
        }

        .${rootElementName}__no-jobs {
          color: #999;
          padding: 15px;
          text-align: center;
        }

        .${rootElementName}__department {
          margin-bottom: 30px;
        }

        .${rootElementName}__department-title {
          font-size: 150%;
          font-weight: bold;
          margin-right: 40px;
          padding-top: 18px;
          margin-bottom: 10px;
        }

        .${rootElementName}__department-positions {
          flex-grow: 1;
        }

        @media (min-width: 1245px) {
          .${rootElementName}__department {
            display: flex;
          }
          .${rootElementName}__department-title {
            width: 250px;
          }
        }
      `;

      if (jobs.length === 0) {
        return `<div class="${rootElementName}__no-jobs">There are currently no jobs available in this department.</div>`;
      }

      let html = "";
      html += "<style type='text/css'>" + styles + "</style>";

      for (let [departmentGroup, groupedJobs] of Object.entries(groupBy(jobs, "department"))) {
        const elements = groupedJobs.map(function(position) {
          return `
            <a href="${PERSONIO_ROOT_URL+ "/job/" + position.id}" target="_blank">
              <b>${position.name}</b>
              <div class="${rootElementName}__position__info">
                ${position.employment_type} 
                &bull;
                ${position.schedule} 
                <br>
                ${position.office}
              </div>
            </a>
          `.trim();
        });

        html += `
          <div class="${rootElementName}__department">
            <div class="${rootElementName}__department-title">
              ${departmentGroup}
            </div>
            <div class="${rootElementName}__department-positions">
              ${elements.join("\n")}
              </div>
            </div>
          `;
      }

      return html;
    }
  }
  document.addEventListener('DOMContentLoaded', function(event) {
    renderPersonioJobs()
  })
}())