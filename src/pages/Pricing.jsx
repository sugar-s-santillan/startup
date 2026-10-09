import futurePagePreview from '../../images/future-page.png';
import PageLayout from '../components/PageLayout.jsx';
import FormInput from '../components/FormInput.jsx';

export default function Pricing() {
  return (
    <PageLayout showBackButton>
      <div className="page-container">
        <section className="pricing-heading">
          <div>
            <p className="page-label">Loan Pricing</p>
            <h1>John Doe</h1>
            <p>Review borrower information and compare eligible lenders.</p>
          </div>
        </section>

        <div className="pricing-grid">
          <section className="content-card">
            <div className="card-heading">
              <h2>Loan Details</h2>
              <p>Borrower and property information</p>
            </div>

            <div className="loan-details">
              <div className="detail-item">
                <span>Loan Officer</span>
                <strong>Leo</strong>
              </div>
              <div className="detail-item">
                <span>Full Name</span>
                <strong>John Doe</strong>
              </div>
              <div className="detail-item">
                <span>Email</span>
                <strong>john.doe@email.com</strong>
              </div>
              <div className="detail-item">
                <span>Phone</span>
                <strong>(512) 555-5555</strong>
              </div>
              <div className="detail-item">
                <span>Address</span>
                <strong>2855 Ridgemont Drive</strong>
              </div>
              <div className="detail-item">
                <span>City</span>
                <strong>Austin</strong>
              </div>
              <div className="detail-item">
                <span>State</span>
                <strong>Texas</strong>
              </div>
              <div className="detail-item">
                <span>ZIP</span>
                <strong>78704</strong>
              </div>
            </div>
          </section>

          <section className="content-card">
            <div className="card-heading">
              <h2>Pricing</h2>
              <p>Enter loan parameters to determine lender eligibility.</p>
            </div>

            <form className="pricing-form">
              <fieldset className="loan-type-fieldset">
                <legend>Loan Type</legend>
                <div className="radio-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      id="purchase"
                      name="loanType"
                      value="purchase"
                      defaultChecked
                    />
                    <span className="radio-card">Purchase</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      id="refinance"
                      name="loanType"
                      value="refinance"
                    />
                    <span className="radio-card">Refinance</span>
                  </label>
                </div>
              </fieldset>

              <FormInput
                label="Property Value"
                id="propertyValue"
                type="number"
                placeholder="$250,000"
              />

              <FormInput
                label="Loan Amount"
                id="loanAmount"
                type="number"
                placeholder="$200,000"
              />

              <div className="form-group">
                <label htmlFor="refinanceType">Refinance Type</label>
                <select id="refinanceType" name="refinanceType">
                  <option value="cashOut">Cash-Out</option>
                  <option value="rateTerm">Rate and Term</option>
                </select>
              </div>

              <FormInput
                label="Borrower Credit Score"
                id="creditScore"
                type="number"
                placeholder="720"
              />

              <button type="button" className="primary-button" disabled>
                Price Loan (Coming Soon)
              </button>
            </form>
          </section>
        </div>

        <section className="content-card preview-card">
          <div className="card-heading">
            <h2>Future Application</h2>
            <p>Planned design for the completed mortgage pricing platform.</p>
          </div>
          <img
            src={futurePagePreview}
            alt="Planned mortgage pricing page"
            className="future-page-image"
          />
        </section>

        <section className="content-card lender-section">
          <div className="card-heading">
            <h2>Eligible Lenders</h2>
            <p>Compare lender guidelines for the current loan scenario.</p>
          </div>

          <div className="integration-status">
            <div className="status-item">
              <span className="status-dot" />
              Third-party property valuation and pricing data will appear here.
            </div>
            <div className="status-item">
              <span className="status-dot" />
              Real-time lender guideline updates received through WebSocket
              will appear here.
            </div>
          </div>

          <div className="table-wrapper">
            <table className="lender-table">
              <thead>
                <tr>
                  <th>Guideline</th>
                  <th>OCMBC</th>
                  <th>BPL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Product</th>
                  <td>DSCR 30-Year Fixed</td>
                  <td>Bridge Loan</td>
                </tr>
                <tr>
                  <th>Minimum Credit Score</th>
                  <td>660</td>
                  <td>620</td>
                </tr>
                <tr>
                  <th>Minimum Loan Amount</th>
                  <td>$75,000</td>
                  <td>$100,000</td>
                </tr>
                <tr>
                  <th>Minimum Property Value</th>
                  <td>$100,000</td>
                  <td>$150,000</td>
                </tr>
                <tr>
                  <th>Late Payments</th>
                  <td>None in 12 months</td>
                  <td>One allowed</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="future-results">
            <p>Third-party pricing results will appear here.</p>
            <p>Live lender guideline updates will appear here.</p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
