
import { Footer, FooterBrand, FooterCopyright, FooterDivider, FooterLink, FooterLinkGroup } from "flowbite-react";
import logopic from "./assets/dynamologo.png"


export default function FooterLogin() {
  return (
    <Footer container >
      <div className="w-full  pr-10 pl-10  mt-0 text-center">
        <div className="w-18 justify-between sm:flex sm:items-center sm:justify-between">
          <FooterBrand
            href="https://dynamopackage.com"
            src={logopic}
            alt="Flowbite Logoa"

          />
          <FooterLinkGroup>
          <FooterLink href="https://www.dynamopackage.com/contact">Contact</FooterLink>
            <FooterLink className="ml-3" href="https://globalpackagetracker.com/policies/impressum">Legal notice</FooterLink>
            <FooterLink className="ml-3" href="https://globalpackagetracker.com/policies/privacy-policy">Privacy Policy</FooterLink>
            <FooterLink className="ml-3" href="https://globalpackagetracker.com/policies/terms-of-service">Terms of service</FooterLink>

          </FooterLinkGroup>
        </div>

      </div>
    </Footer>
  );
}
