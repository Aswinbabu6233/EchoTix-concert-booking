const pdf = require("html-pdf-node");

async function generateTicketPDF(booking) {
  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: "Open Sans", sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 0;
          }
          .main-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            min-height: 90vh;
            padding: 20px;
            background-color: #0a0a0a;
          }
          .innercontainer {
            max-width: 1300px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
          }
          .success-details {
            display: flex;
            flex-wrap: wrap;
            margin: 10px auto;
            gap: 20px;
            background-color: #111;
            border-radius: 10px;
            max-width: 400px;
            padding: 20px;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
          }
          .ticket-div {
            display: flex;
            flex-direction: column;
            background-color: #fff;
            padding: 5px;
            border-radius: 10px;
            mask: radial-gradient(15px at 15px 15px, #0000 98%, #000) -15px -15px;
            color: #000;
            border: 1px solid #ddd;
          }
          .concert-div {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            margin: 5px;
            padding-bottom: 10px;
            border-bottom: 2.5px dotted #222;
          }
          .concert-right {
            flex: 1 1 50%;
            height: 100%;
            align-self: first baseline;
          }
          .concert-right h5 {
            font-size: 13px;
            color: #333;
            margin: 0 0 5px 0;
          }
          .concert-right p {
            font-size: 13px;
            color: #000;
            font-weight: 600;
            text-align: start;
            margin: 2px 0;
          }
          .concert-left img {
            width: 120px;
            height: 120px;
            object-fit: cover;
            border-radius: 10px;
          }
          .qrcode-div {
            display: flex;
            gap: 10px;
            justify-content: space-evenly;
            align-items: center;
            margin-top: 15px;
          }
          .qrcode-div p {
            font-size: 13px;
            color: #000;
            text-align: start;
            margin: 2px 0;
          }
          .qrcode-div h5 {
            font-size: 16px;
            color: #000;
            font-weight: 600;
            text-align: start;
            margin: 0 0 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="main-container">
          <div class="innercontainer">
            <section class="success-details">
              <div class="ticket-div">
                <div class="concert-div">
                  <div class="concert-left">
                    <img
                      src="data:${
                        booking.concert.concertImage.contentType
                      };base64,${booking.concert.concertImage.data.toString(
    "base64"
  )}"
                      alt="Concert Banner"
                    />
                  </div>
                  <div class="concert-right">
                    <h5>${booking.concert.title}</h5>
                    <p>
                      ${new Date(booking.concert.date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )} <span>|</span> ${booking.concert.time12hr}
                    </p>
                    <p>${booking.concert.venue}</p>
                  </div>
                </div>
                <div class="qrcode-div">
                  <div class="qrcode-left">
                    <h5>${booking.concert.band.name}</h5>
                    <p>
                      ${booking.ticketQuantity} ${
    booking.ticketQuantity === 1 ? "Ticket" : "Tickets"
  }
                    </p>
                    <p>₹${booking.totalPrice}</p>
                    <p>
                      ${new Date(booking.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )} <span>|</span>
                      ${new Date(booking.createdAt).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div class="qrcode-right">
                    <img
                      src="${booking.qrcode}"
                      alt="QR Code"
                      width="150"
                      height="150"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </body>
    </html>
  `;

  const file = { content: htmlContent };
  const options = { format: "A4" };

  const pdfBuffer = await pdf.generatePdf(file, options);
  return pdfBuffer;
}

module.exports = generateTicketPDF;
