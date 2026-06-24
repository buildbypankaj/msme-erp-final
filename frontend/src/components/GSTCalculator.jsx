import { useState } from 'react';
import './GSTCalculator.css';

function GSTCalculator() {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [calcType, setCalcType] = useState('exclusive'); // exclusive = add GST, inclusive = extract GST
  const [result, setResult] = useState(null);

  const calculate = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    const rate = parseFloat(gstRate) / 100;

    if (calcType === 'exclusive') {
      const gstAmount = amt * rate;
      const total = amt + gstAmount;
      setResult({
        baseAmount: amt.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        totalAmount: total.toFixed(2),
        cgst: (gstAmount / 2).toFixed(2),
        sgst: (gstAmount / 2).toFixed(2),
      });
    } else {
      const baseAmount = amt / (1 + rate);
      const gstAmount = amt - baseAmount;
      setResult({
        baseAmount: baseAmount.toFixed(2),
        gstAmount: gstAmount.toFixed(2),
        totalAmount: amt.toFixed(2),
        cgst: (gstAmount / 2).toFixed(2),
        sgst: (gstAmount / 2).toFixed(2),
      });
    }
  };

  const reset = () => {
    setAmount('');
    setGstRate('18');
    setCalcType('exclusive');
    setResult(null);
  };

  return (
    <div className="gst-card">
      <h3 className="gst-title">GST Calculator</h3>

      <div className="gst-form">
        <div className="gst-input-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="gst-input-group">
          <label>GST Rate</label>
          <select value={gstRate} onChange={(e) => setGstRate(e.target.value)}>
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
        </div>

        <div className="gst-input-group">
          <label>Type</label>
          <select value={calcType} onChange={(e) => setCalcType(e.target.value)}>
            <option value="exclusive">Add GST (Exclusive)</option>
            <option value="inclusive">Extract GST (Inclusive)</option>
          </select>
        </div>
      </div>

      <div className="gst-buttons">
        <button className="gst-btn calculate" onClick={calculate}>Calculate</button>
        <button className="gst-btn reset" onClick={reset}>Reset</button>
      </div>

      {result && (
        <div className="gst-result">
          <div className="gst-result-row">
            <span>Base Amount</span>
            <strong>₹{result.baseAmount}</strong>
          </div>
          <div className="gst-result-row">
            <span>CGST ({parseFloat(gstRate) / 2}%)</span>
            <strong>₹{result.cgst}</strong>
          </div>
          <div className="gst-result-row">
            <span>SGST ({parseFloat(gstRate) / 2}%)</span>
            <strong>₹{result.sgst}</strong>
          </div>
          <div className="gst-result-row total">
            <span>Total Amount</span>
            <strong>₹{result.totalAmount}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default GSTCalculator;