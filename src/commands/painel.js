import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('painel')
        .setDescription('Cria um painel com o botão para os jogadores criarem suas fichas.'),
    async execute(interaction) {
        
        // Define o seu arquivo local
        const file = new AttachmentBuilder('./src/assets/images/fundo-anime-cidade-escura.jpg');

        // Criar o Embed visualmente agradável apontando para a imagem em anexo
        const embed = new EmbedBuilder()
            .setColor('#2C2F33')
            .setTitle('📝 Departamento de Criação de Fichas')
            .setDescription('Bem-vindo(a) Aventureiro(a)!\n\nClique no botão abaixo para preencher o formulário e gerar ou atualizar a sua ficha de personagem neste servidor.')
            .setImage('attachment://fundo-anime-cidade-escura.jpg') 
            .setFooter({ text: 'Sistema de RPG Automatizado' });

        // Criar o Botão
        const button = new ButtonBuilder()
            .setCustomId('btn_criar_ficha')
            .setLabel('Criar Ficha')
            .setStyle(ButtonStyle.Success)
            .setEmoji('📋');

        const row = new ActionRowBuilder().addComponents(button);

        // Enviar a mensagem para o canal anexando o arquivo
        await interaction.reply({
            embeds: [embed],
            components: [row],
            files: [file] // Importante: envia a foto escondida pro discord conseguir ler!
        });
    },
};
