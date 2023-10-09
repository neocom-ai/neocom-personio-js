(function() {
  /**
   * Hacky script to display jobs on our website based on the personio API.
   * How to use:
   *  * Embed this script
   *  * Add a div with these attributes: `<div class="personio-jobs" data-department="Sales"></div>`
   *  * If `data-department` is null or non existing, all departments will be shown.
   *  * `data-department` can be a list of departments, separated by `,`
   */

  function renderPersonioJobs() {
    const groupBy = function(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };

    const RECRUITEE_URL = 'https://neocom.recruitee.com/api/offers/';
    
    const rootElementName = "personio-jobs";
    const rootElements = document.querySelectorAll(`.${rootElementName}`);

    if (rootElements.length) {
      fetch(RECRUITEE_URL).then(function(response) {
        return response.json()
      }).then(function(resp) {
        rootElements.forEach(function(rootElement) {
          const department = rootElement.getAttribute("data-department");
          const filteredJobs = resp.offers.filter(function(job) {
            return department === null || department.split(",").includes(job.department);
          });
          rootElement.innerHTML = renderJobs(filteredJobs);
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
            <a href="${position.careers_url}" target="_blank">
              <b>${position.title}</b>
              <div class="${rootElementName}__position__info">
                ${position.remote ? "remote" : "onsite (50%)"} / ${position.employment_type_code} 
                <br>
                ${position.location}
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
