import * as readline from 'readline';

// Créer l'interface de lecture
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Lecture synchrone (avec async/await)
async function getUserInput(): Promise<string> {
    return new Promise((resolve) => {
        rl.question('Entrez quelque chose: ', (answer) => {
            resolve(answer);
            rl.close();
        });
    });
}

// Utilisation
async function main() {
    console.log("Quel est votre nom ?");
    const name = await getUserInput();
    console.log(`Bonjour ${name}!`);
}

main();
