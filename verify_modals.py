from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Go to test page
        print("Navigating to test page...")
        page.goto("http://localhost:3000/test-modals")

        # 2. Open Appointment Details
        print("Opening Appointment Details...")
        page.get_by_text("Abrir Detalles (Pendiente)").click()
        page.wait_for_selector("text=Detalles de la Consulta")
        time.sleep(1) # Wait for animation

        # Screenshot Details
        page.screenshot(path="/home/jules/verification/appointment_details.png")
        print("Saved appointment_details.png")

        # Close modal
        page.get_by_role("button", name="Cerrar").click()
        time.sleep(0.5)

        # 3. Open Payment Modal
        print("Opening Payment Modal...")
        page.get_by_text("Abrir Pago Directo").click()
        page.wait_for_selector("text=Registrar Pago")
        time.sleep(1)

        # Screenshot Payment
        page.screenshot(path="/home/jules/verification/payment_modal.png")
        print("Saved payment_modal.png")

        browser.close()

if __name__ == "__main__":
    run()
