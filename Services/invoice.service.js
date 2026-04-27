// Services/invoice.service.js
import puppeteer from "puppeteer";
import Order from "../Models/orders.js";

/**
 * InvoiceService
 * Professional invoice generator with modern design
 */
class InvoiceService {
    formatCurrency(value) {
        return `₹${(Number(value) || 0).toFixed(2)}`;
    }

    formatDate(d) {
        try {
            const date = new Date(d);
            return date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return String(d);
        }
    }

    async generateInvoiceHTML(order) {
        const addr = (order.address && order.address[0]) || {};
        const subtotal = order.totalAmount ?? order.items?.reduce((s, it) => s + (it.price * (it.quantityKg || 1)), 0) ?? 0;
        const tax = 0;
        const total = subtotal + tax;
        
        return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice - ${order._id}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Poppins', sans-serif;
    background: #f5f5f5;
    padding: 40px 20px;
    -webkit-font-smoothing: antialiased;
  }

  .invoice-wrapper {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 50px 60px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 3px solid #ddd;
  }

  .invoice-title {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -1px;
  }

  .company-info {
    text-align: right;
  }

  .company-name {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .company-tagline {
    font-size: 14px;
    color: #666;
  }

  /* Invoice Details */
  .invoice-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .bill-to {
    flex: 1;
  }

  .bill-to h3 {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  .customer-name {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .customer-details {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
  }

  .customer-details p {
    margin: 3px 0;
  }

  .invoice-meta {
    text-align: right;
  }

  .total-due-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  .total-amount {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .meta-info {
    font-size: 14px;
    line-height: 1.8;
  }

  .meta-info p {
    margin: 4px 0;
  }

  /* Items Table */
  .items-table {
    width: 100%;
    margin: 30px 0;
    border-collapse: collapse;
  }

  .items-table thead {
    background: #000;
    color: white;
  }

  .items-table thead th {
    padding: 15px 12px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .items-table thead th:nth-child(2),
  .items-table thead th:nth-child(3),
  .items-table thead th:nth-child(4) {
    text-align: center;
  }

  .items-table tbody td {
    padding: 18px 12px;
    border-bottom: 1px solid #eee;
    font-size: 15px;
  }

  .items-table tbody td:nth-child(2),
  .items-table tbody td:nth-child(3),
  .items-table tbody td:nth-child(4) {
    text-align: center;
  }

  .items-table tbody tr:nth-child(even) {
    background: #fafafa;
  }

  /* Totals Section */
  .totals-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 40px;
  }

  .payment-method {
    flex: 1;
  }

  .payment-method h3 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .payment-method p {
    font-size: 14px;
    margin: 6px 0;
  }

  .totals-box {
    width: 320px;
    border-left: 3px solid #000;
    padding-left: 20px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 15px;
  }

  .total-row.grand {
    border-top: 2px solid #000;
    margin-top: 10px;
    padding-top: 15px;
    font-size: 20px;
    font-weight: 700;
  }

  /* Footer */
  .footer {
    margin-top: 80px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .thank-you {
    font-size: 22px;
    font-weight: 700;
  }

  .signature-section {
    text-align: center;
  }

  .signature-name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    padding-top: 10px;
    border-top: 2px solid #000;
  }

  .signature-title {
    font-size: 14px;
    color: #666;
  }

  @media print {
    body {
      background: white;
      padding: 0;
    }
    
    .invoice-wrapper {
      box-shadow: none;
      padding: 30px;
    }
  }
</style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Header -->
    <div class="header">
      <div class="invoice-title">INVOICE</div>
      <div class="company-info">
        <div class="company-name">Govigi</div>
        <div class="company-tagline">Your Business Partner</div>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="bill-to">
        <h3>Invoice To:</h3>
        <div class="customer-name">${order.name}</div>
        <div class="customer-details">
          <p><strong>P:</strong> ${order.contact}</p>
          <p><strong>E:</strong> ${order.email || "N/A"}</p>
          <p><strong>A:</strong> ${addr.landmark || ""}${addr.landmark ? ", " : ""}${addr.city || ""}${addr.city ? ", " : ""}${addr.state || ""} ${addr.pincode || ""}</p>
        </div>
      </div>

      <div class="invoice-meta">
        <div class="total-due-label">Total Due</div>
        <div class="total-amount">${this.formatCurrency(total)}</div>
        <div class="meta-info">
          <p><strong>No:</strong> ${String(order._id).slice(-10)}</p>
          <p><strong>Date:</strong> ${this.formatDate(order.createdAt).split(',')[0]}</p>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>SERVICE</th>
          <th>QTY</th>
          <th>PRICE</th>
          <th>TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantityKg}</td>
            <td>${this.formatCurrency(item.price)}</td>
            <td>${this.formatCurrency(item.price * item.quantityKg)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="payment-method">
        <h3>Payment Method:</h3>
        <p><strong>Bank Name:</strong> ${order.paymentMethod || "Cash on Delivery"}</p>
        <p><strong>Account:</strong> ${order._id}</p>
      </div>

      <div class="totals-box">
        <div class="total-row">
          <span>Sub-total:</span>
          <span>${this.formatCurrency(subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>${this.formatCurrency(tax)}</span>
        </div>
        <div class="total-row grand">
          <span>Total:</span>
          <span>${this.formatCurrency(total)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="thank-you">Thank you for purchase!</div>
      <div class="signature-section">
        <div class="signature-name">Govigi Team</div>
        <div class="signature-title">Administrator</div>
      </div>
    </div>
  </div>
</body>
</html>
`;
    }

    /**
     * generateInvoice(orderId)
     * Generates a professional PDF invoice
     */
    async generateInvoice(orderId) {
        const order = await Order.findById(orderId).lean();
        if (!order) throw new Error("Order not found");

        const html = await this.generateInvoiceHTML(order);

        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ],
        });

        try {
            const page = await browser.newPage();
            
            // Set viewport for better rendering
            await page.setViewport({ 
                width: 1200, 
                height: 1600, 
                deviceScaleFactor: 2 
            });
            
            await page.setContent(html, { 
                waitUntil: ["networkidle0", "domcontentloaded"] 
            });
            
            await page.emulateMediaType("print");

            // Generate PDF with optimal settings
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                preferCSSPageSize: false,
                margin: { 
                    top: "20mm", 
                    right: "15mm", 
                    bottom: "20mm", 
                    left: "15mm" 
                },
            });

            await page.close();
            return pdfBuffer;
        } finally {
            await browser.close();
        }
    }
}

export default new InvoiceService();