import "@goauthentik/admin/common/ak-license-notice";
import "@goauthentik/admin/providers/ldap/LDAPProviderForm";
import "@goauthentik/admin/providers/oauth2/OAuth2ProviderForm";
import "@goauthentik/admin/providers/proxy/ProxyProviderForm";
import "@goauthentik/admin/providers/saml/SAMLProviderForm";
import "@goauthentik/admin/providers/saml/SAMLProviderImportForm";
import { DEFAULT_CONFIG } from "@goauthentik/common/api/config";
import { AKElement } from "@goauthentik/elements/Base";
import "@goauthentik/elements/forms/ProxyForm";
import { paramURL } from "@goauthentik/elements/router/RouterOutlet";
import "@goauthentik/elements/wizard/FormWizardPage";
import {
    TypeCreateWizardPage,
    TypeCreateWizardPageLayouts,
} from "@goauthentik/elements/wizard/TypeCreateWizardPage";
import "@goauthentik/elements/wizard/Wizard";

import { msg, str } from "@lit/localize";
import { customElement } from "@lit/reactive-element/decorators/custom-element.js";
import { CSSResult, TemplateResult, html } from "lit";
import { property } from "lit/decorators.js";

import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

import { ProvidersApi, TypeCreate } from "@goauthentik/api";

@customElement("ak-provider-wizard-initial")
export class InitialProviderWizardPage extends TypeCreateWizardPage {
    layout = TypeCreateWizardPageLayouts.grid;
    onSelect(type: TypeCreate): void {
        this.host.steps = ["initial", `type-${type.component}`];
        this.host.isValid = true;
    }
    renderHint(): TemplateResult {
        return html`<div class="pf-c-hint">
                <div class="pf-c-hint__title">${msg("Try the new application wizard")}</div>
                <div class="pf-c-hint__body">
                    ${msg(
                        "The new application wizard greatly simplifies the steps required to create applications and providers.",
                    )}
                </div>
                <div class="pf-c-hint__footer">
                    <a
                        class="pf-c-button pf-m-link pf-m-inline"
                        href=${paramURL("/core/applications", {
                            createForm: true,
                        })}
                        >${msg("Try it now")}</a
                    >
                </div>
            </div>
            <br />`;
    }
}

@customElement("ak-provider-wizard")
export class ProviderWizard extends AKElement {
    static get styles(): CSSResult[] {
        return [PFBase, PFButton];
    }

    @property()
    createText = msg("Create");

    @property({ attribute: false })
    providerTypes: TypeCreate[] = [];

    @property({ attribute: false })
    finalHandler: () => Promise<void> = () => {
        return Promise.resolve();
    };

    async firstUpdated(): Promise<void> {
        this.providerTypes = await new ProvidersApi(DEFAULT_CONFIG).providersAllTypesList();
    }

    render(): TemplateResult {
        return html`
            <ak-wizard
                .steps=${["initial"]}
                header=${msg("New provider")}
                description=${msg("Create a new provider.")}
                .finalHandler=${() => {
                    return this.finalHandler();
                }}
            >
                <ak-provider-wizard-initial slot="initial" .types=${this.providerTypes}>
                </ak-provider-wizard-initial>
                ${this.providerTypes.map((type) => {
                    return html`
                        <ak-wizard-page-form
                            slot=${`type-${type.component}`}
                            .sidebarLabel=${() => msg(str`Create ${type.name}`)}
                        >
                            <ak-proxy-form type=${type.component}></ak-proxy-form>
                        </ak-wizard-page-form>
                    `;
                })}
                <button slot="trigger" class="pf-c-button pf-m-primary">${this.createText}</button>
            </ak-wizard>
        `;
    }
}
