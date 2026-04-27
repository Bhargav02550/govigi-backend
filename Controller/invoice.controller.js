import InvoiceService from "../Services/invoice.service.js";

export const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;

        const pdf = await InvoiceService.generateInvoice(orderId);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=invoice-${orderId}.pdf`
        );

        return res.send(pdf);

    } catch (err) {
        console.error("Invoice Error:", err);
        res.status(500).json({
            error: "Failed to generate invoice",
            details: err.message,
        });
    }
};