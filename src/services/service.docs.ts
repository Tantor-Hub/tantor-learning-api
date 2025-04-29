import { Injectable } from "@nestjs/common";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class DocsService {

    async generateROI({ fullname }: { fullname: string }): Promise<{ filename: string; contentType: string; content: Buffer }> {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 11;
        const margin = 50;
        const lineHeight = 14;
        const pageHeight = 842;
        const pageWidth = 595;
        const usableHeight = pageHeight - 2 * margin;

        const paragraphs = `
      RÈGLEMENT INTÉRIEUR DU CENTRE DE FORMATION
      
      ________________________________________
      
      PRÉAMBULE
      
      Le présent règlement intérieur a pour objectif d'encadrer l'organisation et le fonctionnement des formations dispensées par TANTOR. Il définit les droits et obligations des stagiaires, des formateurs et du personnel administratif en vue d'assurer un cadre d'apprentissage respectueux, sécurisé et conforme aux exigences légales.
      
      Ce règlement s'applique à toutes les personnes inscrites ou présentes dans l'établissement, qu'elles suivent une formation en présentiel ou à distance, ainsi qu'aux bénéficiaires d'un bilan de compétences. Il s'impose également aux formateurs et aux intervenants extérieurs.
      
      Tout stagiaire ou bénéficiaire s'engage à respecter ce règlement dès son inscription.
      
      ________________________________________
      
      1. CHAMP D'APPLICATION
      
      Le règlement intérieur s'applique aux activités suivantes :
      
      • Les formations en présentiel dispensées dans les locaux de TANTOR ou dans des lieux partenaires.
      • Les formations à distance (e-learning, visioformation, plateformes numériques).
      • Les bilans de compétences, qu'ils soient réalisés en présentiel ou à distance.
      • L'utilisation de la plateforme de formation pour les ressources en ligne et le suivi des cours.
      
      ________________________________________
      
      2. RÈGLES RELATIVES AUX FORMATIONS EN PRÉSENTIEL
      
      2.1 - Horaires et ponctualité
      
      • Les horaires des formations sont communiqués aux stagiaires avant le démarrage de la session.
      • Les stagiaires doivent respecter les horaires fixés sous peine d'être exclus de la session en cas de retard supérieur à 15 minutes.
      • Les absences doivent être justifiées auprès de l'administration au plus tard 24 heures avant la session concernée.
      
      2.2 - Comportement et discipline
      
      • Un comportement respectueux est exigé à l'égard des formateurs, du personnel et des autres stagiaires.
      • Toute forme de violence, harcèlement, discrimination ou propos injurieux fera l'objet de sanctions.
      • L'usage du téléphone portable est interdit durant les sessions sauf indication contraire du formateur.
      
      2.3 - Hygiène et sécurité
      
      • Les stagiaires doivent veiller à la propreté des locaux et respecter les consignes de sécurité.
      • Il est interdit de fumer ou vapoter dans l'établissement.
      • Tout incident ou accident doit être signalé immédiatement à un responsable.
      
      ________________________________________
      
      3. RÈGLES RELATIVES AUX FORMATIONS À DISTANCE
      
      3.1 - Accès à la plateforme de formation
      
      • L'accès à la plateforme est nominatif et personnel. Tout partage d'identifiants est strictement interdit.
      • En cas de difficulté technique, contacter le support à support@tantorlearning.com.
      
      3.2 - Participation et engagement
      
      • Les stagiaires doivent assister aux visioconférences avec leur caméra activée et dans un environnement calme.
      • La ponctualité est requise. Un retard supérieur à 10 minutes peut entraîner une exclusion temporaire de la session.
      • Les exercices et évaluations doivent être rendus dans les délais impartis.
      
      ________________________________________
      
      4. RÈGLES RELATIVES AUX BILANS DE COMPÉTENCES
      
      4.1 - Déroulement du bilan
      
      • Le bilan se déroule en trois phases : préliminaire, investigation, conclusion.
      • Une participation active est requise afin d'assurer la pertinence des résultats.
      
      4.2 – Confidentialité
      
      • Toutes les informations échangées lors du bilan sont strictement confidentielles.
      • Le rapport de synthèse est remis uniquement au bénéficiaire sauf demande expresse.
      
      ________________________________________
      
      5. UTILISATION DE LA PLATEFORME DIGITALE
      
      5.1 - Règles générales
      
      • Les contenus numériques sont la propriété exclusive de TANTOR.
      • Toute reproduction, diffusion ou modification sans autorisation est interdite.
      
      5.2 - Maintenance et support
      
      • En cas de problème technique, ou de difficultés lors de la connexion, contacter le support à support@tantorlearning.com.
      
      ________________________________________
      
      6. SANCTIONS DISCIPLINAIRES
      
      Tout manquement au présent règlement peut donner lieu à :
      1. Un avertissement verbal : Il est notifié au stagiaire de manière orale par un formateur ou un responsable pédagogique pour un premier manquement léger au règlement intérieur.
      2. Un avertissement écrit : En cas de récidive ou de comportement inapproprié plus sérieux, le stagiaire reçoit un courrier officiel indiquant la nature de la faute et les conséquences en cas de récidive.
      3. Une exclusion temporaire : Lorsque les avertissements n’ont pas été suivis d’effet ou si la gravité de la faute le justifie immédiatement, le stagiaire peut être exclu temporairement de la formation. La durée de cette exclusion est déterminée par la direction du centre de formation.
      4. Une exclusion définitive : En cas de faute grave, notamment en cas de comportement perturbateur répété, de violence, d’acte de fraude ou de non-respect flagrant des engagements pédagogiques, une exclusion définitive peut être prononcée. Le stagiaire ne pourra alors plus suivre de formation au sein de TANTOR Business School.
      
      Modalités d’application des sanctions :
      
      • Toute sanction est précédée d’un entretien avec le stagiaire afin de lui permettre de s’expliquer sur les faits reprochés.
      • Les décisions d’exclusion sont notifiées par écrit et enregistrées dans le dossier administratif du stagiaire.
      • Un droit de recours est accordé au stagiaire qui peut contester la décision par courrier adressé à la direction dans un délai de 7 jours.
      
      ________________________________________
      
      7. ACCEPTATION DU RÈGLEMENT INTÉRIEUR
      
      Le présent règlement intérieur doit être lu et signé par chaque stagiaire avant le démarrage de la formation.
      `.split('\n');

        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        for (const paragraph of paragraphs) {
            if (y <= margin + lineHeight) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
            }
            page.drawText(paragraph, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
            y -= lineHeight;
        }

        const form = pdfDoc.getForm();

        // Dernière page pour les champs à remplir
        if (y <= 150) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
        }

        page.drawText('Fait à :', { x: margin, y: 100, size: fontSize, font });
        const cityField = form.createTextField('lieu');
        cityField.setText('');
        cityField.addToPage(page, { x: margin + 50, y: 90, width: 200, height: 18 });

        page.drawText('Le :', { x: margin, y: 70, size: fontSize, font });
        const dateField = form.createTextField('date');
        dateField.setText('');
        dateField.addToPage(page, { x: margin + 50, y: 60, width: 200, height: 18 });

        page.drawText('Signature du Stagiaire :', { x: margin, y: 40, size: fontSize, font });
        const signatureField = form.createTextField('signature');
        signatureField.setText('');
        signatureField.addToPage(page, { x: margin + 140, y: 30, width: 300, height: 18 });

        form.updateFieldAppearances(font);

        const pdfBytes = await pdfDoc.save();
        
        return {
            filename: 'tantor-roi.pdf',
            contentType: 'application/pdf',
            content: Buffer.from(pdfBytes)
        }
    }
}