import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ChannelType, AttachmentBuilder } from 'discord.js';
import { salvarFicha } from '../utils/database.js';

// Função para exibir o Modal quando o botão é clicado
export async function handleButtonInteraction(interaction) {
    // Criação do Modal
    const modal = new ModalBuilder()
        .setCustomId('modal_ficha')
        .setTitle('Sua Ficha de RPG');

    // Campo 1: Nome do Personagem
    const nomeInput = new TextInputBuilder()
        .setCustomId('input_nome')
        .setLabel('Nome do Personagem')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Todoroki Shoto')
        .setRequired(true);

    // Campo 2: Idade, Sexo, Gênero e Ocupação
    const dadosPessoaisInput = new TextInputBuilder()
        .setCustomId('input_dados')
        .setLabel('Idade, Sexualidade, Gênero, Ocupação')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Ex: 16 anos, Heterossexual, Masculino, Estudante')
        .setRequired(true);

    // Campo 3: Aparência (Breve Descrição)
    const aparenciaInput = new TextInputBuilder()
        .setCustomId('input_aparencia')
        .setLabel('Aparência')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Cabelo meio branco e meio vermelho, olhos de cores diferentes')
        .setRequired(true);

    // Campo 4: Poderes
    const poderInput = new TextInputBuilder()
        .setCustomId('input_poder')
        .setLabel('Poder (Título e Descrição)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Meio quente Meio frio: Cria gelo e fogo (pode ser detalhista, mas não passe de 200 caracteres)')
        .setRequired(true);

    // Campo 5: Arma (Opcional)
    const armaInput = new TextInputBuilder()
        .setCustomId('input_arma')
        .setLabel('Arma (Opcional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Se usar armas, detalhe aqui. (Máx 100 caracteres)')
        .setRequired(false);

    // Adicionando os campos no Modal
    modal.addComponents(
        new ActionRowBuilder().addComponents(nomeInput),
        new ActionRowBuilder().addComponents(dadosPessoaisInput),
        new ActionRowBuilder().addComponents(aparenciaInput),
        new ActionRowBuilder().addComponents(poderInput),
        new ActionRowBuilder().addComponents(armaInput)
    );

    // Abre o modal na tela do usuário
    await interaction.showModal(modal);
}

// Função para processar os dados quando o formulário é enviado
export async function handleModalSubmit(interaction) {
    // IMPORTANTE: Avisa o Discord pra "esperar um pouco" porque vamos bater no Banco de Dados
    // Isso evita The "Unknown interaction" (3 segundos de timeout)
    await interaction.deferReply({ ephemeral: true });

    // Coleta as respostas do form
    const nome = interaction.fields.getTextInputValue('input_nome');
    const dadosPessoais = interaction.fields.getTextInputValue('input_dados');
    const aparencia = interaction.fields.getTextInputValue('input_aparencia');
    const poder = interaction.fields.getTextInputValue('input_poder');
    // Extrai e ajusta caso não tenha enviado arma
    const armaAjustada = interaction.fields.getTextInputValue('input_arma') || 'Nenhuma (Sem armas)';

    const jogadorId = interaction.user.id;

    // Salva no pseudo-banco de dados (Supabase agora!)
    const dadosFicha = {
        playerId: jogadorId,
        nome,
        dadosPessoais,
        aparencia,
        poder,
        arma: armaAjustada,
        criadoEm: new Date().toISOString()
    };
    
    await salvarFicha(jogadorId, dadosFicha);

    // Formata o texto exatamente como solicitado no formato-ficha.txt,
    // adaptando a linha de "Dados Pessoais" que nós agrupamos no pop-up!
    const textoFormatado = `╔═.✾. ═════════════╗
 
 Ficha de Personagem 
 - Destiny RPG

╚═════════════.✾. ═╝

➤ **Nome:** ${nome}
➤ **Idade, Sex., Gênero e Ocupação:** ${dadosPessoais}
➤ **Aparência:** ${aparencia}
➤ **Poder:** ${poder}
➤ **Arma:** ${armaAjustada}`;

    // Monta o visual da Ficha Finalizada só com a Descrição Base do seu TXT
    const fichaEmbed = new EmbedBuilder()
        .setColor('#8B0000') // Vermelho Escuro
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(textoFormatado)
        .setImage('attachment://fundo-anime-cidade-escura.jpg') // Usa a imagem local
        .setTimestamp()
        .setFooter({ text: 'Sistema Destiny RPG' });

    // O arquivo em si (Silencioso para o Discord conseguir renderizar o link acima)
    const file = new AttachmentBuilder('./src/assets/images/fundo-anime-cidade-escura.jpg');

    // Busca o canal específico nas configurações (caso você tenha colocado o ID no .env)
    const idCanalOficial = process.env.CANAL_FICHAS_ID;
    const canalOficial = interaction.client.channels.cache.get(idCanalOficial);

    // Se você configurou o ID certo, a ficha vai para o canal oficial
    if (canalOficial) {
        try {
            // Se o canal de fichas for um "Fórum" (Posts), ele cria um novo Post!
            if (canalOficial.type === ChannelType.GuildForum) {
                await canalOficial.threads.create({
                    name: `Ficha: ${nome}`,
                    message: { 
                        embeds: [fichaEmbed],
                        files: [file]
                    }
                });
            } else {
                // Se for um Canal de Texto comum, ele manda a mensagem normal
                await canalOficial.send({ embeds: [fichaEmbed], files: [file] });
            }

            // E o bot responde apenas para o jogador (Invisível pro servidor)
            await interaction.editReply({
                content: `🎉 A ficha de <@${jogadorId}> foi criada com sucesso e postada no <#${idCanalOficial}>!`
            });
        } catch (err) {
            console.error("Erro ao enviar para o canal:", err);
            await interaction.editReply({
                content: `Erro bizarro! O bot tentou enviar no canal oficial mas não conseguiu. Tem certeza que ele tem permissão de 'Criar Posts' no Fórum?`
            });
        }
    } else {
        // Se o ID do canal não estiver no .env, ele responde no próprio chat
        await interaction.editReply({
            content: `🎉 A ficha de <@${jogadorId}> foi adicionada com sucesso! *(Nota: O canal oficial não foi encontrado)*`,
            embeds: [fichaEmbed],
            files: [file]
        });
    }
}
