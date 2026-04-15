import { handleButtonInteraction, handleModalSubmit } from '../components/fichaModal.js';

export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // LIDAR COM COMANDOS DE BARRA (/painel)
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Houve un erro ao executar este comando!', ephemeral: true });
                }
            }
        }
        
        // LIDAR COM CLIQUES NOS BOTÕES
        else if (interaction.isButton()) {
            if (interaction.customId === 'btn_criar_ficha') {
                console.log(`[DEBUG] Usuário ${interaction.user.tag} clicou no botão de Criar Ficha.`);
                try {
                    await handleButtonInteraction(interaction);
                    console.log(`[DEBUG] Modal aberto com sucesso para ${interaction.user.tag}.`);
                } catch (err) {
                    console.error("❌ Erro grave ao tentar ABRIR o formulário:", err);
                    await interaction.reply({ content: "Ocorreu um erro interno ao abrir o formulário. Veja os logs do servidor.", ephemeral: true }).catch(() => {});
                }
            }
        }
        
        // LIDAR COM O ENVIO DO FORMULÁRIO (MODAL)
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'modal_ficha') {
                console.log(`[DEBUG] Usuário ${interaction.user.tag} enviou (submit) o formulário preenchido.`);
                try {
                    await handleModalSubmit(interaction);
                    console.log(`[DEBUG] Ficha de ${interaction.user.tag} processada com sucesso no código.`);
                } catch (err) {
                    console.error("❌ Erro grave ao PROCESSAR a ficha:", err);
                    // Como nós possivelmente demos "deferReply" lá dentro, usamos followUp no catch pra não quebrar
                    try {
                        await interaction.followUp({ content: "Erro fatal ao enviar a ficha pro banco/canal. Verifique os logs do servidor Render.", ephemeral: true });
                    } catch {
                        await interaction.reply({ content: "Erro fatal ao enviar a ficha pro banco/canal.", ephemeral: true }).catch(() => {});
                    }
                }
            }
        }
    },
};
