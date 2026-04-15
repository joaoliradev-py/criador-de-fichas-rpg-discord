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
                await handleButtonInteraction(interaction);
            }
        }
        
        // LIDAR COM O ENVIO DO FORMULÁRIO (MODAL)
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'modal_ficha') {
                await handleModalSubmit(interaction);
            }
        }
    },
};
