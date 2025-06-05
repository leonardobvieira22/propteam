vamos criar um sistema que servirá para traders saberem se seus saques serão ou nao autorizados de acordo com as regras das mesas propietarias, irei enviar as regras da primeira mesa que iremos integrar [YLOS TRADING]
para que voce crie o codigo python completo que ira rodar no backend
utilize nosso diretorio como base para o front end [estilos]
a ideia é trabalhar com diversas mesas, porem vamos iniciar com a YLOS.
o sistema precisa ser maleavel, cada codigo python sera treinado de acordo com as regras de cada mesa
como ideia pro front end, pensei em uma interface amigavel aonde o usuario primeiro seleciona a mesa
insere o relatorio csv que sera analisado pelo codigo python
responde algumas perguntas basicas como:
Perguntas Necessárias para Análise do Relatório CSV - Ylos Trading

1. Qual é o tipo da sua conta? (Digite o número correspondente)
   [1] Conta Master Funded
   [2] Conta Instant Funding
   Resposta: \_

2. Qual é o seu saldo atual (em USD)?
   Exemplo: 51616.20
   Resposta: \_

3. Qual é o fuso horário das operações no relatório CSV?
   Exemplo: -03 (BRT), -04 (NY com DST), -05 (NY sem DST)
   Resposta: \_

4. Você deseja verificar a conformidade com eventos noticiosos? (S/N)
   Se sim, saiba que a ylos nao define exatamente quais sao as noticias que você pode ou nao estar posicionado [vericaremos quais operaçoes voce estava posicionado durante as noticias, porem esse a YLOS TRADING não especifica explicitamente quais noticias ou não voce pode estar posicionado]

5. Quantos saques você já realizou nesta conta?
   Exemplo: 0, 1, 2, 3, 4 ou mais
   Resposta: \_

(regras ylos trading)

Início
Desafios
Termos de uso
FAQs
login
Bandeira Brasil
Bandeira Estados Unidos
Bandeira Espanha
O que é o produto Instant Funding da Ylos Trading?
Seta

O Instant Funding é um produto da Ylos Trading que proporciona acesso imediato a uma Conta Funded, sem a necessidade de passar por uma fase de avaliação, como a Conta Challenge. Com o Instant Funding, você começa a negociar diretamente com capital financiado pela Ylos, sujeito às regras da Conta Funded, com algumas modificações exclusivas que oferecem maior flexibilidade para saques.

1. Qual é o diferencial do Instant Funding em relação à Conta Funded tradicional?
   O diferencial do Instant Funding é que ele elimina a necessidade de uma fase de teste (como a Conta Challenge), permitindo que você inicie imediatamente as operações em uma Conta Funded. Além disso, possui regras ajustadas para facilitar os saques, incluindo:

- Redução do mínimo de dias operados de 10 para 5.

- Redução do mínimo de dias vencedores de 7 para 5.

- Aumento do lucro mínimo por dia para ser considerado vencedor, de $50,00 para $200,00.

- Redução da regra de consistência de 40% para 30%, permitindo que um único dia represente até 30% do lucro total da conta.

Essas alterações tornam o Instant Funding uma opção mais acessível para traders experientes que desejam negociar com capital financiado sem passar por um processo de avaliação.

2. Quais são as regras do Instant Funding?

As regras do Instant Funding são as mesmas da Conta Master Funded tradicional, com as seguintes exceções:

- Dias de Negociação: Para solicitar um saque, você deve operar por pelo menos 5 dias (em vez de 10).
- Dias Vencedores: Mínimo de 5 dias vencedores. Um dia vencedor é definido como aquele com lucro líquido de pelo menos $200,00 (em vez de $50,00).
- Regra de Consistência: Nenhum dia pode representar mais de 30% do lucro total da conta (em vez de 40%). Essa regra é reiniciada após cada solicitação de saque.
- Inatividade: Você não pode ficar mais de 30 dias sem operar, sob pena de cancelamento da conta.
- Posicionamento Durante Notícias: Não é permitido manter posições abertas durante a divulgação de notícias, mas você pode operar após o anúncio, respeitando outras regras de risco.
- Estratégia de Médio (Averaging Down): Permitido até 3 médios por operação, independentemente de saídas parciais.
- Drawdown: O drawdown é do tipo trailing, ajustado em tempo real, até que você alcance um lucro equivalente ao valor do drawdown mais $100,00, quando se torna estático.
- Taxas de Corretagem: Há cobrança de corretagem nas operações ($0,52 por contrato micro e $1,55 por contrato mini).

Outras regras, como limite de 20 contas por usuário, regras de risco versus retorno, proibição de hedging, flipping e "all-in", permanecem iguais às da Conta Master Funded. Consulte as regras completas no site oficial da Ylos Trading (ylostrading.com).

3. Quanto custa o Instant Funding?

O custo do Instant Funding varia de acordo com o tamanho da conta escolhida (25K, 50K, 100K, 150K, 250K ou 300K). Consulte a tabela de preços no site oficial da Ylos Trading (ylostrading.com) para os valores atualizados.

4. Quais são os requisitos para solicitar um saque no Instant Funding?

Para solicitar um saque no Instant Funding, você deve atender aos seguintes critérios:

- Operar por pelo menos 5 dias, com pelo menos 5 dias vencedores, com cada dia vencedor gerando um lucro líquido de pelo menos $200,00.
- Manter o saldo da conta acima do valor do drawdown mais $100,00 (por exemplo, $52,600 para uma conta de 50K).
- Garantir que nenhum dia represente mais de 30% do lucro total da conta, conforme a regra de consistência.

Os saques seguem as mesmas condições da Conta Master Funded: mínimo de $500, limites iniciais para os primeiros 4 saques (por exemplo, $2,000 para uma conta de 50K), 100% dos primeiros $15,000 de lucro e 90% dos lucros subsequentes, com processamento em até 3 dias úteis para confirmação e 5 dias úteis para pagamento.

5. Posso usar o Replicador de Ordens Oficial da Ylos no Instant Funding?

Sim, você pode usar o Replicador de Ordens Oficial da Ylos no Instant Funding, conforme permitido para todas as contas da Ylos Trading. No entanto, outros replicadores de ordens e qualquer tipo de automação de negociação, como bots ou algoritmos, são proibidos para garantir a integridade das operações do trader.

O que é o produto No Activation Fee da Ylos Trading?
Seta

O No Activation Fee é um novo produto da Ylos Trading que permite aos traders demonstrarem suas habilidades de negociação em uma conta de avaliação (similar à Conta Challenge) com a vantagem de não pagar taxa de ativação ao atingir a meta e avançar para uma Conta Funded. Você paga apenas um custo inicial na compra da conta, e, ao alcançar o objetivo de lucro, pode ativar a Conta Funded sem custos adicionais.

1. Quais são as regras do No Activation Fee?

As regras do No Activation Fee são idênticas às da Conta Challenge tradicional, incluindo:
Dias de Negociação: Mínimo de 1 dia e máximo de 30 dias para completar a avaliação.
Número de Contas: Não há limite para o número de contas No Activation Fee que você pode abrir.
Posicionamento Durante Notícias: É permitido manter posições abertas durante a divulgação de notícias.
Estratégia de Média (Averaging Down): Não há limite diário para o uso de estratégias de média ou scalping.
Drawdown: O drawdown é ajustado ao final do dia (EOD – End of Day). Se o saldo da conta cair abaixo do valor de drawdown permitido durante o dia, a conta será imediatamente bloqueada.
Meta de Lucro: Você deve atingir a meta de lucro definida para a conta dentro do período de 30 dias para se qualificar para a Conta Funded.
Consulte as regras completas da Conta Challenge no site oficial da Ylos Trading para mais detalhes.

2. Qual é o diferencial do No Activation Fee em relação à Conta Challenge tradicional?

O diferencial do No Activation Fee é que não há taxa de ativação para avançar para a Conta Funded após atingir a meta de lucro. Na Conta Challenge tradicional, você paga uma taxa de ativação para converter sua conta em uma Conta Master Funded. Com o No Activation Fee, você paga apenas o custo inicial da compra da conta, e a ativação da Conta Funded é gratuita, reduzindo os custos para começar a negociar com capital financiado.

3. Quanto custa o No Activation Fee?

O custo do No Activation Fee varia de acordo com o tamanho da conta escolhida (25K, 50K, 100K, 150K, 250K ou 300K). Consulte a tabela de preços no site oficial da Ylos Trading (ylostrading.com) para os valores atualizados.

4. Como funciona a transição para a Conta Funded com o No Activation Fee?

Ao atingir a meta de lucro estabelecida para o tamanho da sua conta No Activation Fee (em pelo menos 1 dia de negociação dentro do período de 30 dias), você se qualifica para ativar uma Conta Funded. Siga estes passos:
Verifique a Elegibilidade: Um botão de "Upgrade" aparecerá no seu painel de controle após atingir a meta.
Ativação: Clique no botão "Upgrade" para ativar a Conta Funded. Não será cobrada nenhuma taxa de ativação, ao contrário da Conta Challenge tradicional.
Acesso: Após a ativação, você receberá instruções para acessar a Conta Funded e continuar negociando com capital financiado, sujeito às regras da Conta Master.

5. Posso renovar minha conta No Activation Fee se não atingir a meta em 30 dias?

Sim, se você não atingir a meta de lucro dentro do período de 30 dias, pode renovar sua conta No Activation Fee por mais 30 dias. O custo de renovação será o mesmo valor pago inicialmente, incluindo quaisquer descontos aplicados na compra original. Se a conta tiver um saldo positivo no final do período, esse saldo será mantido na renovação; se estiver abaixo do valor inicial, uma nova conta será criada com saldo zero.

6. Posso usar o Replicador de Ordens Oficial da Ylos no No Activation Fee?

Sim, você pode usar o Replicador de Ordens Oficial da Ylos no No Activation Fee, conforme permitido para todas as contas da Ylos Trading. No entanto, outros replicadores de ordens e qualquer tipo de automação de negociação, como bots ou algoritmos, são proibidos para garantir a integridade da avaliação das habilidades do trader.

O que é a Ylos Trading?
Seta

A Ylos Trading é uma mesa proprietária criada com o objetivo de oferecer as melhores condições e oportunidades para os traders, democratizando ainda mais o mercado financeiro.

Entre seus diferenciais está o fato de que é a primeira mesa proprietária do mundo a utilizar a tecnologia Black Arrow, desenvolvida exclusivamente pela Neológica para essa iniciativa.

FAQ - Replicador de Ordens Ylos Trading
Seta

1. O que é o Replicador de Ordens?

O Replicador de Ordens é uma ferramenta da Nelogica que permite replicar suas operações de uma conta principal para outras contas automaticamente e em tempo real. Com ele, você gerencia várias contas de forma simples e eficiente.

2. Como funciona o Replicador na Ylos?

Você opera na sua conta principal dentro do BlackArrow, a plataforma da Nelogica integrada à Ylos, e as ordens são replicadas instantaneamente para as contas seguidoras que você configurar no novo painel. Basta vincular as contas e começar!

3. Preciso ter várias contas para usar o Replicador?

Sim, o Replicador é ideal para quem tem mais de uma conta ativa no novo painel. Ele replica suas ordens da conta principal para as demais que você vincular.

4. Quais são os planos disponíveis na Ylos?

Oferecemos três opções:

One: USD 25/mês (até 2 contas seguidoras).
Plus: USD 59/mês (até 5 contas seguidoras).
Pro: USD 109/mês (até 10 contas seguidoras).

Escolha o que melhor se adapta às suas necessidades!

5. O Replicador funciona fora do novo painel da Ylos?

Não, atualmente ele opera exclusivamente no novo painel da Ylos Trading, garantindo integração total e mais agilidade.

6. É necessário manter várias plataformas abertas?

Não! Após configurar o Replicador no novo painel, ele funciona sozinho no BlackArrow, sem precisar de outras instâncias abertas.

7. Como ativo o Replicador na minha conta?

Acesse o novo painel da Ylos a partir de 14 de março de 2025, às 13h, selecione o módulo Replicador de Ordens e siga as instruções para vincular suas contas. Simples e rápido!

8. Posso contratar o Replicador diretamente com a Nelogica?

Não, o Replicador deve ser contratado exclusivamente pelo painel da Ylos Trading. Apenas essa versão é aceita pela nossa mesa. Qualquer outra forma de automação é expressamente proibida e pode resultar em penalidades.

9. Posso usar o Replicador tanto na conta Challenge quanto na conta Funded?

Sim, o Replicador pode ser usado tanto em contas Challenge quanto em contas Funded, desde que estejam vinculadas no novo painel da Ylos e operadas pelo BlackArrow.

10. O que faço se tiver problemas com o Replicador?

Entre em contato com nosso suporte pelo chat no painel da Ylos ou envie sua dúvida para a equipe. Estamos aqui para ajudar!
Como faço para adquirir uma conta da Ylos Trading?
Seta

Para adquirir uma conta na Ylos Trading, siga este passo a passo:

Acesse o Site Oficial: Vá até o site da Ylos Trading em ylostrading.com.
Escolha o Tipo de Conta: Na página inicial ou na seção de produtos, você verá as opções de contas disponíveis. A Ylos oferece Contas Challenge (de teste) com diferentes tamanhos de capital, como 25K, 50K, 100K, 150K, 250K e 300K. Selecione o tamanho da conta que deseja adquirir.
Cadastre-se ou Faça Login:
Se você ainda não tem uma conta, clique em "Start now” ou "Login" e preencha os dados solicitados (nome, e-mail, senha, etc.). Você pode se cadastrar como Pessoa Física (PF) ou Pessoa Jurídica (PJ), fornecendo os dados correspondentes (CPF ou CNPJ, por exemplo).
Se já possui cadastro, faça login com seu e-mail e senha.
Selecione o Plano e Confirme: Após escolher a conta, clique em "Buy Now" ou similar. Você será direcionado para uma página onde poderá revisar os detalhes da compra, incluindo o preço da Conta Challenge (por exemplo, $150 para 25K, $180 para 50K, etc.) e aplicar cupons de desconto, se disponíveis.
Preencha os Detalhes de Faturamento: Informe os dados necessários, como nome, sobrenome, país/região, e detalhes de pagamento. Para residentes fora dos EUA, use um cartão de crédito com função internacional ou cartão de débito com saldo em dólar; para residentes americanos, cartão de crédito ou débito comum é aceito.
Efetue o Pagamento: Complete o pagamento com seu cartão. Os valores são em dólares (USD), e o processamento geralmente é instantâneo para métodos de pagamento eletrônico.
Confirmação e Ativação: Após o pagamento ser confirmado, você receberá uma notificação por e-mail e sua conta será ativada, geralmente em poucas horas (máximo de 24 horas, dependendo da verificação). Você também terá acesso ao BlackArrow, a plataforma de trading da Ylos.
Acesse o BlackArrow: Com a conta ativada, você receberá instruções para acessar a plataforma BlackArrow, que será utilizada para suas operações de trading.
Dicas:

Descontos: Verifique se há cupons de desconto disponíveis, pois a Ylos pode oferecer promoções que reduzem significativamente o custo da Conta Challenge.
Suporte: Se encontrar problemas durante o processo, entre em contato com o suporte via support@ylostrading.com ou pelo chat ao vivo no site.
Termos e Condições: Leia os termos de uso e as políticas da Ylos Trading antes de prosseguir para entender todas as regras e responsabilidades.
Quais os meios de pagamento aceitos para a compra de contas na Ylos Trading?
Seta

Para a compra de contas na Ylos Trading, são aceitos apenas pagamentos em crédito e débito. Para residentes de fora dos EUA que desejam comprar contas na Ylos Trading, apenas cartões de crédito com função internacional ou cartões de débito com saldo em dólar são aceitos. As principais bandeiras como Visa e Mastercard são válidas. Todas as transações são processadas de forma segura com criptografia dos dados do. Lembre-se de que sua instituição financeira pode ter limites ou restrições para transações internacionais, e o valor será refletido na próxima fatura do cartão de crédito ou imediatamente deduzido do saldo do cartão de débito.

Posso pagar com PIX na Ylos Trading?
Seta

Não, a Ylos Trading não aceita PIX como meio de pagamento para a compra de contas. Os meios de pagamento aceitos são restritos a cartões de crédito com função internacional e cartões de débito com saldo em dólar para residentes de fora dos EUA, e para residentes americanos, pagamentos podem ser feitos com cartão de crédito ou débito.

Quero conhecer a Ylos Trading, posso me cadastrar sem ter comprado uma conta?
Seta

Sim, é possível se cadastrar na Ylos Trading para conhecer o painel do trader mesmo sem ter comprado uma conta. No entanto, sem a compra de uma conta (Challenge ou Master), você terá acesso apenas a informações gerais e não terá acesso completo às funcionalidades de trading, incluindo a plataforma BlackArrow. Para acessar todas as funcionalidades da plataforma, incluindo a utilização do BlackArrow para operações de trading, é necessário comprar uma conta. O cadastro inicial permite que você explore o ambiente, entenda como funciona a transição de uma conta Challenge para uma conta Master, veja as regras, etc.

Quanto tempo após a aquisição da conta poderei operar na Ylos Trading?
Seta

Após adquirir uma conta na Ylos Trading, você geralmente poderá começar a operar imediatamente ou dentro de algumas horas, dependendo de alguns fatores:

Processamento do Pagamento: Assim que o pagamento pela conta for confirmado, o processo de ativação começa. Se você usar um método de pagamento instantâneo, como cartões de crédito ou serviços de pagamento online, a confirmação pode ocorrer quase imediatamente.
Ativação da Conta: Após a confirmação do pagamento e qualquer verificação necessária, sua conta será ativada. Normalmente, esse processo é automatizado, mas em casos raros, pode levar até 24 horas para que todos os sistemas sejam atualizados com sua nova conta.
Liberação do BlackArrow: Uma vez que sua conta esteja ativada, o acesso ao BlackArrow, a plataforma de trading utilizada pela Ylos Trading, também será liberado. Geralmente, assim que sua conta de trading está pronta, você receberá instruções ou um link para baixar e instalar o BlackArrow, ou poderá acessá-lo diretamente através da plataforma da Ylos. A liberação do BlackArrow ocorre simultaneamente com a ativação da sua conta, permitindo que você comece a operar sem demora.
Quais as regras da conta Challenge na Ylos Trading?
Seta

Na Ylos Trading, a conta Challenge, que é a fase de avaliação para traders, possui as seguintes regras:

Dias Negociados: Você tem um mínimo de 1 dia e um máximo de 30 dias para completar o desafio. Isso implica que você deve mostrar suas habilidades de trading dentro desse período.
Quantidade de Contas: Não há limite para o número de contas Challenge que você pode abrir. Isso significa que você tem a flexibilidade de tentar quantas vezes forem necessárias para alcançar o sucesso.
Posicionamento Durante Notícias: É permitido estar posicionado durante a divulgação de notícias. Isso oferece a oportunidade de explorar estratégias que se beneficiam das flutuações de mercado causadas por anúncios econômicos ou eventos mundiais.
Limite Diário de Estratégia "Médio para Trás": Não há um limite específico para o uso de estratégias de médio prazo ou scalping. Isso dá aos traders a liberdade de escolher suas abordagens de trading sem restrições diárias quanto ao estilo de operação.
Drawdown: O drawdown na conta Challenge é ajustado ao final do dia (EOD), o que significa que o valor do drawdown só é oficialmente registrado e ajustado ao término do dia de negociação. No entanto, se em qualquer momento do dia o saldo da conta cair abaixo do valor permitido do drawdown, a conta será imediatamente bloqueada.
Observação Importante: Para o bem de seus resultados e para garantir uma correta evolução como trader, recomendamos que a conta Challenge seja operada com a mesma seriedade e disciplina que se dedicaria a uma conta Master. Embora as regras sejam mais flexíveis, a abordagem profissional ao trading é essencial para o sucesso na avaliação e no futuro com uma conta Master Funded.

Essas regras são desenhadas para permitir que os traders demonstrem suas habilidades em um ambiente realista de mercado, preparando-os para avançar para uma conta com mais responsabilidades e benefícios.

Quais as regras da conta Master na Ylos Trading?
Seta

Na Ylos Trading, a conta Master, que é uma conta aprovada e com direito a saques, possui as seguintes regras:

Dias Negociados: Para poder solicitar o saque é necessário operar pelo menos 10 dias, e dentro desses dias, pelo menos 7 devem ser vencedores, onde um dia vencedor é definido como tendo ganhos de no mínimo $50,00. Além disso, não pode ficar mais do que 30 dias sem operar, sob pena de cancelamento da conta.
Quantidade de Contas: É permitido um máximo de 20 contas por usuário.
Posicionamento Durante Notícias: Não é permitido estar posicionado durante a divulgação de notícias, mas o trader pode operar após o anúncio, respeitando outras regras de risco.
Limite de Estratégia "Médio para Trás": É permitido fazer até 3 médios para trás por operação, independentemente de saídas parciais.
Drawdown: O drawdown é do tipo trailing, ajustado em tempo real, até que você atinja um lucro equivalente ao valor do drawdown mais US$ 100. A partir desse ponto, o drawdown se torna estático.
· Corretagem: Na conta Master, há a cobrança de corretagem sobre as operações realizadas.

Observação Importante: A conta Master exige uma abordagem profissional de trading, com regras mais rigorosas para assegurar a sustentabilidade e a integridade das operações.

Essas regras são desenhadas para promover uma prática de trading disciplinada, consistente e sustentável na conta Master, garantindo tanto a proteção do capital do trader quanto a saúde financeira da Ylos Trading.

Qual a diferença principal entre as contas Challenge e as Master Funded Accounts, ou Contas Master?
Seta

Conta Challenge:

Finalidade: É uma conta de avaliação, onde os traders têm a oportunidade de demonstrar suas habilidades.
Regras Operacionais: Possui regras mais flexíveis, permitindo uma maior liberdade operacional. Isso significa que as restrições sobre como você pode operar são menos rigorosas, dando mais espaço para experimentação e aprendizagem.
Drawdown: O drawdown é calculado ao final do dia (EOD), ajustado apenas no fechamento diário para evitar que oscilações intradiárias afetem negativamente a conta.
Master Funded Account ou Conta Master:

Finalidade: Após a aprovação na fase de avaliação, a conta Master é ativada, permitindo saques dos lucros obtidos.
Regras Operacionais: As regras são mais rigorosas, refletindo a confiança depositada no trader. Este rigor visa garantir a sustentabilidade e a segurança tanto do trader quanto da empresa.
Drawdown: Utiliza um sistema de drawdown trailing em tempo real. Uma vez que você atinge um lucro que cobre o drawdown inicial mais US$ 100, o drawdown se torna estático, fixando o limite de perda. Isso oferece um controle mais preciso sobre os riscos assumidos.
Em resumo, a principal diferença reside na natureza das contas: a Conta Challenge serve como uma plataforma de teste com menos restrições, enquanto a Conta Master, sendo uma conta de produção, impõe regras mais rígidas para proteger tanto o capital do trader quanto o desempenho financeiro da Ylos Trading.

Como saberei que tenho direito a uma conta Master, e como habilitá-la?
Seta

Para poder passar da conta Challenge para a conta Master na Ylos Trading, você precisa ter operado por pelo menos 1 dia na conta e ter atingido a meta financeira estabelecida para essa conta. Após atingir essa meta, você já está elegível para avançar para a conta Master.

Para ativar a conta Master, siga estes passos:

Verifique a Eligibilidade: Uma vez que você tenha cumprido os requisitos de operação e meta financeira, um botão de Upgrade aparecerá na parte inferior do seu painel de controle.
Habilitação do Botão Upgrade: Este botão será habilitado automaticamente na virada do dia, às 00h de Chicago. Portanto, você deve estar atento ao horário para não perder a oportunidade de atualização.
Ativar a Conta Master: Clique no botão Upgrade assim que ele estiver disponível. Para a conta ser transformada em Master, o usuário deverá fazer o pagamento da taxa de ativação. Após o pagamento, sua conta Challenge será convertida em uma conta Master.
Lembre-se de que a transição para a conta Master deve ser feita com cuidado, pois isso implica em novas regras e responsabilidades. Certifique-se de revisar as regras da conta Master antes de fazer a transição para garantir que está preparado para operar sob essas novas condições.

Posso comprar a conta Master sem ter passado pelo processo de avaliação da conta Challenge?
Seta

Não, na Ylos Trading, não é possível comprar diretamente uma conta Master sem primeiro passar pelo processo de avaliação da conta Challenge. A conta Challenge serve como uma fase de avaliação onde os traders demonstram suas habilidades e consistência no mercado, garantindo que apenas aqueles que cumprem os critérios estabelecidos possam avançar para uma conta Master. Isso é uma prática padrão para assegurar que os traders estejam preparados para operar com as responsabilidades e regras associadas a uma conta Master.

Quais são as taxas para aquisição de contas da Ylos?
Seta

A Ylos Trading possui duas taxas distintas: uma para a aquisição da Conta Desafio (conta de teste) e outra para a habilitação da Conta Master. Os custos são os seguintes:

Tabela de Preços Normais:

Tamanho da conta

25K

50K

100K

150K

250K

300K

Conta Desafio

$150,00

$180,00

$230,00

$320,00

$510,00

$667,00

Habilitação da Conta Master

$110,00

$130,00

$200,00

$250,00

$300,00

$340,00

Valores em dólares USD

Tabela com Desconto de 80% para Conta Desafio:

Tamanho da conta

25K

50K

100K

150K

250K

300K

Conta Desafio - Preço Normal

$150,00

$180,00

$230,00

$320,00

$510,00

$667,00

Conta Desafio - Desconto 80%

$30,00

$36,00

$40,00

$64,00

$102,00

$113,40

Valores em dólares USD

Observações:

Promoções e Descontos: A Ylos Trading pode oferecer cupons de desconto ou promoções especiais que reduziriam significativamente o custo da aquisição da Conta Desafio. No exemplo acima, um desconto de 80% é aplicado, mostrando como os preços podem ser substancialmente reduzidos.
Conta Desafio vs. Conta Master: A Conta Desafio é a fase de avaliação onde você demonstra suas habilidades de trading. Após passar pela avaliação, há uma taxa adicional para habilitar a Conta Master, que é a conta onde você pode operar com capital financiado pela Ylos e solicitar saques.
Formas de Pagamento: A compra das contas pode ser feita usando cartões de crédito com função internacional ou cartões de débito com saldo em dólar para residentes fora dos EUA; para residentes americanos, tanto cartão de crédito quanto de débito são aceitos.
Renovação: Se você não passar no período de 30 dias da Conta Desafio, a renovação para tentar novamente custará o mesmo preço pago inicialmente pela conta, incluindo qualquer desconto aplicado na compra original.

Nota: Os preços e promoções podem variar; sempre verifique no site oficial da Ylos Trading ou entre em contato com o suporte para as informações mais atualizadas sobre taxas e descontos.

Estou positivo em uma conta Challenge, mas não atingi o objetivo de gain dentro dos 30 dias. Ao renovar minha conta, continuarei com saldo positivo?
Seta

Sim, na Ylos Trading, se sua conta Challenge possui saldo positivo, ao renovar a conta por mais 30 dias, você permanecerá com o saldo positivo. No entanto, se o saldo da conta estiver abaixo do valor inicial, uma nova conta será criada para você com o saldo zerado.

Detalhes sobre a Política de Renovação na Ylos Trading

Contas Challenge:

Renovação Automática: A renovação da conta Challenge é automática, a não ser que o trader cancele a conta através do painel de controle antes da renovação.
Saldo Positivo: Se sua conta Challenge possui um saldo positivo ao final dos 30 dias, você continuará com esse saldo na renovação. Isso dá ao trader a oportunidade de continuar a busca pelo objetivo de ganhos a partir do saldo positivo já acumulado.
Saldo Negativo: Se o saldo da conta estiver abaixo do valor inicial ao término do período de 30 dias, uma nova conta Challenge será criada para o trader com o saldo zerado, voltando ao valor inicial definido para essa conta.
Objetivo de Ganhos: O trader deve sempre buscar atingir o objetivo de ganhos dentro do novo ciclo de 30 dias para avançar para uma conta Master.
Importante:

Cancelamento: O trader tem a opção de cancelar a renovação da conta para evitar a cobrança de uma nova taxa de avaliação. Isso deve ser feito antes da data de renovação para evitar cobranças automáticas.
Avisos: A Ylos Trading pode enviar avisos ou notificações sobre a renovação automática, mas é responsabilidade do trader monitorar seu painel para tomar decisões informadas sobre a continuidade ou cancelamento da conta.
Essa política de renovação é projetada para permitir que os traders tenham várias oportunidades de demonstrar suas habilidades de trading enquanto mantém a integridade e a estrutura do processo de avaliação

Comprei minha conta com desconto, mas não passei no teste dentro do período de 30 dias. Qual será o valor para renovação?
Seta

Na Ylos Trading, para a renovação da conta Challenge, o valor cobrado será o mesmo preço que você pagou no momento da compra, incluindo quaisquer descontos aplicados. Portanto, se você comprou sua conta com um desconto, na renovação, esse desconto também será aplicado, mantendo o preço de renovação igual ao valor inicial pago pela conta.

As contas podem ser adquiridas também como pessoa jurídica na Ylos Trading?
Seta

Sim, é permitido que uma pessoa jurídica compre contas e opere pela Ylos Trading. Para adquirir uma conta como Pessoa Jurídica (PJ), você deve utilizar os dados da PJ durante o cadastro e compra da conta. No entanto, há algumas considerações importantes:

Saques: Se uma conta foi cadastrada como Pessoa Jurídica, o pagamento dos lucros só será feito em contas bancárias de Pessoa Jurídica. O mesmo princípio se aplica para contas cadastradas como Pessoa Física (PF), onde os pagamentos serão feitos apenas para contas bancárias de PF.
Cadastro: Durante o processo de compra e ativação da conta, você precisará fornecer as informações da empresa, como CNPJ, razão social, e outros dados corporativos necessários para a verificação.
Regras Operacionais: Independentemente de ser uma conta de PF ou PJ, as regras operacionais da Ylos Trading, incluindo limites de drawdown, dias de operação, e outras diretrizes de trading, permanecem as mesmas.
Portanto, se sua empresa está interessada em trading através da Ylos Trading, é possível adquirir contas como Pessoa Jurídica, mas certifique-se de entender e seguir todas as políticas de operação e saque específicas para PJ.

Como comprar a conta como pessoa jurídica na Ylos Trading?
Seta

Para comprar uma conta da mesa como pessoa jurídica (PJ) na Ylos Trading, siga os passos abaixo:

Acesso ao Site da Ylos Trading:
Vá até o site oficial da Ylos Trading (ylostrading.com).
Escolha da Conta:
Selecione a conta que deseja adquirir. A Ylos Trading oferece diferentes tipos de contas (Challenge, Master Funded Account, etc.). Escolha a que melhor se adapta às necessidades da sua empresa.
Cadastro como Pessoa Jurídica:
No momento de criar a conta, faça o cadastro como Pessoa Jurídica. Você será solicitado a fornecer informações específicas da empresa:
CNPJ: O Cadastro Nacional de Pessoa Jurídica da sua empresa.
Razão Social: O nome oficial da empresa conforme registrado.
Informações Adicionais: Pode incluir o endereço da empresa, nome do representante legal, entre outros dados necessários para a verificação.
Processo de Compra:
Siga o processo de compra normal, onde você escolherá o método de pagamento. Certifique-se de usar uma forma de pagamento vinculada à conta bancária da sua empresa para manter a consistência com o cadastro PJ.
Pagamento:
Complete o pagamento. A Ylos Trading geralmente aceita pagamentos via cartão de crédito, débito, e outras formas de pagamento eletrônico. Certifique-se de que o pagamento esteja alinhado com a legislação de pagamentos para empresas.
Verificação de Documentos:
Após o pagamento, a Ylos Trading pode solicitar documentos adicionais para verificação, como o contrato social, prova de endereço da empresa, etc. Este é um procedimento padrão para garantir a conformidade com as normas de KYC (Know Your Customer) e AML (Anti-Money Laundering).
Ativação da Conta:
Uma vez que todos os documentos sejam verificados e o pagamento confirmado, sua conta será ativada. Você receberá instruções sobre como acessar a plataforma de trading BlackArrow ou qualquer outra informação necessária para começar a operar.
Operação e Saques:
Com a conta ativa, você pode começar a operar. Lembre-se, qualquer saque ou lucro será direcionado para uma conta bancária de Pessoa Jurídica, conforme registrado na Ylos Trading.
Ao seguir esses passos, você poderá adquirir e operar uma conta de trading como pessoa jurídica na Ylos Trading de maneira eficiente e conforme as exigências legais e regulatórias.

Minha conta na Ylos Trading foi cadastrada como Pessoa Jurídica. Posso sacar meu lucro em minha conta bancária de Pessoa Física?
Seta

Não, você não pode sacar lucros de uma conta cadastrada como Pessoa Jurídica (PJ) em uma conta bancária de Pessoa Física (PF). Na Ylos Trading, as políticas de saque são estritamente definidas para garantir conformidade com as regulamentações financeiras e fiscais. Aqui estão alguns pontos importantes:

É importante lembrar que, independentemente da conta, a utilização dessa estratégia deve ser feita com cautela, avaliando sempre os riscos envolvidos e mantendo um controle emocional e estratégico rigoroso

Portanto, é fundamental que o saque seja feito para a conta bancária correta conforme o tipo de registro da conta de trading na Ylos. Se você está operando como PJ, os saques devem ser direcionados para uma conta bancária de PJ.

Quais plataformas estão habilitadas a operar na Ylos Trading?
Seta

A única plataforma oficialmente habilitada pela Ylos Trading para operações de trading é o BlackArrow, especificamente a versão Pro. Nenhuma outra plataforma além do BlackArrow Pro é atualmente suportada ou homologada pela Ylos Trading para suas atividades de trading financiado.

Preciso adquirir plugin para habilitar o preço médio na Ylos Trading?
Seta

Não, você não precisa adquirir nenhum plugin adicional para habilitar ou usar a estratégia de preço médio na Ylos Trading. A plataforma BlackArrow, que é a única homologada pela Ylos, já vem equipada com todas as funcionalidades necessárias para implementar estratégias de trading, incluindo a de "preço médio para trás" (ou DCA - Dollar-Cost Averaging).

Quais os custos da plataforma operacional para quem tiver conta na Ylos Trading?
Seta

O uso da plataforma operacional BlackArrow na Ylos Trading é gratuito para usuários com conta ativa, seja Challenge ou Master. Dados de mercado são fornecidos sem custo adicional enquanto sua conta estiver ativa. Outros custos a considerar incluem taxas de renovação para contas Challenge se os objetivos financeiros não forem atingidos, taxas de ativação para a conta Master e possíveis custos operacionais associados ao trading, como corretagem para contas Master.

O que é a Nelogica e qual sua relação com a Ylos?
Seta

A Nelogica é uma empresa brasileira focada em desenvolver soluções tecnológicas para o mercado financeiro, conhecida por suas plataformas de trading como o BlackArrow e o Profit, que permitem a análise e a execução de operações no mercado. A Nelogica não é uma corretora, mas um fornecedor de software que ajuda traders a entender e operar melhor no mercado financeiro.

A Ylos Trading, por sua vez, é uma mesa proprietária que oferece contas financiadas após um processo de avaliação para traders. A relação entre Nelogica e Ylos é de parceria tecnológica, onde a Nelogica fornece a plataforma BlackArrow para que a Ylos possa operar. Isso significa que os traders da Ylos utilizam o BlackArrow para analisar o mercado, executar ordens e gerenciar suas posições de trading. A colaboração garante que a Ylos disponha de uma infraestrutura de trading robusta e atualizada, permitindo que a empresa se concentre na avaliação e financiamento de traders enquanto a Nelogica se encarrega da tecnologia de trading.

Quais ativos poderão ser operados na Ylos Trading?
Seta

Somente os seguintes ativos são válidos e liberados para uso na Ylos Trading:

Mini Nasdaq
Micro Nasdaq
Mini S&P500
Micro S&P500
Micro Bitcoin Futuro
Mini Russell 2000
Códigos dos Contratos - O que são e como diferenciar minis e micro contratos de Nasdaq e S&P500?
Seta

O que são Códigos de Contratos?

Os códigos de contratos são identificadores alfanuméricos usados nas bolsas de valores para especificar os contratos futuros. Eles geralmente consistem em letras e números que indicam o tipo de ativo, o mês de vencimento e o ano do contrato.

Minis e Micro Contratos:

Minis: São contratos futuros que representam uma fração do valor do contrato futuro padrão. São projetados para serem mais acessíveis a traders individuais ou de varejo, permitindo uma entrada no mercado com menos capital.
Micros: São ainda menores que os minis, oferecendo uma oportunidade de trading com ainda menos capital necessário e menor risco por contrato. Eles são ideais para traders que querem exposição aos movimentos do mercado com menor compromisso financeiro.
Códigos Específicos para Nasdaq e S&P500:

Nasdaq:

Mini Nasdaq (NQ):
Código: O código para o mini contrato do Nasdaq-100 na CME Group utiliza "NQ" seguido por uma letra que indica o mês de vencimento e um número para o ano. Por exemplo, "NQH5" representa o mini contrato do Nasdaq-100 com vencimento em março de 2025 (H para março, 5 para 2025).
Micro Nasdaq (NM):
Código: Para os micro contratos do Nasdaq-100, o código é "NM" seguido pela letra do mês de vencimento e o número do ano. Por exemplo, "NMH5" é para o micro contrato com vencimento em março de 2025.
S&P500:

Mini S&P500 (ES):
Código: Os minis do S&P500 são identificados pelo código "ES" mais a letra do mês de vencimento e o dígito final do ano. Por exemplo, "ESH5" refere-se ao mini contrato do S&P500 com vencimento em março de 2025.
Micro S&P500 (ET):
Código: Para os micro contratos do S&P500, usa-se "ET" com a mesma lógica, como "ETH5" para o vencimento em março de 2025.
Como Diferenciar:

Letras de Identificação: A principal distinção vem da letra inicial ou combinação de letras que identificam o ativo:
"NQ" para Mini Nasdaq vs. "NM" para Micro Nasdaq.
"ES" para Mini S&P500 vs. "ET" para Micro S&P500.
Mês de Vencimento: As letras seguintes no código indicam o mês de vencimento (H para março, M para junho, U para setembro, Z para dezembro, etc.).
Ano: O número ao final do código especifica o ano de vencimento.
Entender esses códigos é crucial para traders que operam em mercados futuros, permitindo que eles saibam exatamente qual contrato está sendo negociado, seu tamanho e data de vencimento.

Dentro do mesmo ambiente e com o mesmo IP de internet, poderia usar a plataforma em mais de um PC ao mesmo tempo?
Seta

Não, na Ylos Trading, não é permitido usar a plataforma em mais de um PC ao mesmo tempo, mesmo se estiverem dentro do mesmo ambiente e compartilhando o mesmo IP de internet. Para operar em múltiplos dispositivos simultaneamente, você precisaria comprar uma conta para cada usuário/PC.

Poderei operar via celular na Ylos Trading?
Seta

Sim, você poderá operar via celular na Ylos Trading. A plataforma é compatível com dispositivos móveis, permitindo que você execute suas operações de trading diretamente do seu smartphone. Aqui estão alguns detalhes importantes:

Aplicativo BlackArrow: A plataforma de trading BlackArrow, usada pela Ylos Trading, oferece versões para dispositivos móveis. Você pode baixar o aplicativo BlackArrow para iOS e Android através das respectivas lojas de aplicativos.
Funcionalidades Completas: A versão móvel do BlackArrow inclui a maioria das funcionalidades disponíveis na versão desktop, permitindo que você monitore o mercado, coloque e gerencie ordens, acesse gráficos, indicadores e ferramentas de análise em tempo real.
Configuração: Após a ativação da sua conta na Ylos Trading e a liberação do BlackArrow, você receberá instruções sobre como baixar e configurar o aplicativo no seu celular. A configuração geralmente é simples, envolvendo apenas o login com suas credenciais de conta.
Performance e Estabilidade: A plataforma foi projetada para oferecer uma experiência de trading eficiente até mesmo em dispositivos móveis, garantindo que você não perca oportunidades de mercado por estar fora do computador.
Conveniência: Operar via celular dá a você a flexibilidade de gerenciar suas posições de qualquer lugar, a qualquer hora, desde que tenha uma conexão à internet.
Portanto, para operar via celular, certifique-se de ter a aplicação BlackArrow instalada no seu dispositivo, e você estará pronto para negociar com a mesma eficácia que teria em um computador desktop.

Preciso me preocupar com a quantidade de traders logando simultaneamente, corremos algum risco de ter perda de performance da plataforma por isso?
Seta

Não, você não precisa se preocupar com a quantidade de traders logando simultaneamente na plataforma da Ylos Trading. A tecnologia Black Arrow, utilizada pela plataforma, foi desenvolvida para operar em diversas corretoras e países, com uma estrutura robusta que suporta um volume imenso de usuários sem perda de performance. Isso significa que a plataforma está preparada para lidar com múltiplos acessos ao mesmo tempo, garantindo uma experiência de trading eficiente e sem interrupções para todos os usuários.

A Black Arrow na Ylos Trading é mais do que apenas uma ferramenta de trading; é um ecossistema que visa capacitar traders através de tecnologia inovadora, análise de mercado profunda e uma experiência de usuário otimizada. Isso faz com que os traders possam focar no que realmente importa: o mercado e suas estratégias de trading.

A Ylos Trading segue todas as regulações locais e americanas?
Seta

Sim, a Ylos Trading declara que segue todas as regulações locais e americanas aplicáveis ao seu modelo de negócio.

Quais são as regras de consistência na Ylos Trading?
Seta

Na Ylos Trading, a consistência é um componente central para o sucesso e a sustentabilidade das operações de trading, especialmente para contas Master. Aqui estão as principais regras de consistência que os traders devem seguir:

Mínimo de Dias Operados:
Os traders devem operar por pelo menos 10. Isso garante que o trader está ativamente envolvido no mercado e não está apenas esperando por movimentos favoráveis específicos.
Mínimo de Dias Vencedores:
Dentro desses 10 dias operados, é necessário ter pelo menos 7 dias vencedores. Um dia vencedor é definido como um dia que termina com um ganho líquido de pelo menos $50,00. Isso promove uma abordagem consistente e lucrativa, incentivando estratégias que visam ganhos regulares ao invés de grandes ganhos com risco elevado.
Regra dos 40%:
Nenhum dia pode ter um lucro superior a 40% do lucro total da conta. Esta regra é zerada após cada pedido de saque, incentivando uma gestão de risco prudente e evitando que traders apostem tudo em uma única operação.
P/L Drawdown:
Um único trade não pode perder mais do que 50% do lucro acumulado na conta. Esta regra aplica-se após o trader ter acumulado um "colchão" de segurança. Ela ajuda a manter a consistência e a proteger os lucros acumulados contra perdas significativas.
DCA (Médios para Trás):
Não pode fazer mais do que 3 médios para trás por operação, independentemente de saídas parciais. Isso limita a prática de média de preço para reduzir perdas, incentivando uma abordagem mais disciplinada.
Consistência no Uso de Contratos:
Ajustes nos contratos são permitidos para adaptação ao mercado, mas não para estratégias de "all in" ou para apenas contar o dia como operado. Isso garante que os traders operem com um volume consistente e planejado, refletindo uma estratégia de mercado realista.
Risco x Retorno:
Uma operação não deve ter uma expectativa de prejuízo superior a 5 vezes a mediana das operações ganhadoras. Isso promove a consistência ao equilibrar o risco com o potencial de retorno.
Hedging e Flipping:
Proibido operar posições contrárias em contas diferentes simultaneamente ou operar de forma diferente apenas para contar o dia como operado. Isso assegura que os traders mantenham uma estratégia coerente e não manipulem seus resultados de trading.
All In (Gambling):
Proibido operar no limite máximo da conta esperando um movimento rápido a favor. Essa regra evita comportamentos de risco excessivo que não são sustentáveis a longo prazo.
Inatividade:
O trader não pode ficar mais do que 30 dias sem operar, sob pena de cancelamento da conta. Isso assegura um engajamento contínuo e consistente com o mercado.
Essas regras são desenhadas para promover uma prática de trading disciplinada, sustentável e consistente, permitindo que tanto os traders quanto a Ylos Trading se beneficiem de um ambiente de negociação seguro e produtivo.

O que é Drawdown?
Seta

Drawdown é um termo financeiro que se refere à queda de valor ou perda de capital de um investimento ou conta de trading a partir de seu pico mais alto até seu ponto mais baixo subsequente. Em outras palavras, é a medida da redução do valor de um portfólio desde seu valor máximo até o valor mínimo que ele atinge durante um período específico.

Na Ylos Trading, o drawdown não é apenas um indicador de risco; ele é uma ferramenta essencial para a gestão de risco. Ele ajuda a avaliar o potencial de perda que um investidor ou trader pode enfrentar, permitindo estabelecer limites claros de quanto capital pode ser perdido sem que a estratégia de investimento ou a conta de negociação seja encerrada ou sofra ajustes significativos.

Importância para a Sustentabilidade: O conceito de drawdown é vital para manter operações de trading sustentáveis, garantindo que mesmo em momentos de alta volatilidade, as perdas sejam controláveis, promovendo um ambiente de trading seguro e estratégico para todos os envolvidos.

Portanto, na Ylos Trading, o drawdown é mais do que uma simples medida de risco; é um componente chave para uma gestão de risco eficaz, ajudando a moldar traders que são conscientes e capazes de operar dentro de parâmetros financeiros seguros.

Como Funciona o Drawdown na Ylos Trading?
Seta

1. Contas Desafio:

O drawdown é calculado ao final do dia (EOD - End of Day). Ele é ajustado apenas no fechamento diário, evitando que oscilações intradiárias impactem negativamente a conta. Não há ajuste de drawdown durante o dia ou durante operações, sendo efetuado exclusivamente ao final do dia.

2. Master Funded Accounts:

O drawdown é do tipo trailing, ajustado em tempo real, até que você atinja um lucro equivalente ao valor do drawdown mais US$ 100. A partir desse ponto, o drawdown se torna estático.

Exemplo para uma conta de US$ 50.000:

O drawdown é de US$ 2.500, estabelecendo o limite de perda em US$ 47.500.
Se você lucrar US$ 500, seu saldo passará a ser US$ 50.500.
Seu drawdown continua em US$ 2.500.
Seu novo limite de perda será de US$ 48.000.

Uma vez ajustado, o limite de perda não retorna ao valor anterior. Quando os lucros acumulados alcançarem US$ 2.600, o drawdown se torna estático e o limite de perda será fixado em US$ 50.100.

O que é a regra de consistência de 40%?
Seta

A Regra de Consistência de 40%, ou "Regra dos 40%", determina que, ao solicitar um saque, não mais do que 40% do saldo de lucro na conta Master pode vir de um único dia de negociação. Esta regra é válida desde o primeiro dia de operações até o pedido do saque. Aqui estão alguns pontos importantes:

Período de Aplicação: Esta regra se aplica desde o primeiro dia que você começa a negociar na sua conta Master até o momento em que você solicita o saque.
Reset da Regra: Após você solicitar um saque, a regra dos 40% é resetada. Isso significa que o cálculo começa novamente a partir do dia do pedido de saque para determinar se o próximo saque cumpre ou não com a regra. Dessa forma, cada pedido de saque marca o início de um novo período de avaliação para a aplicação da regra.
Objetivo: O propósito desta regra é incentivar a diversificação do fluxo de lucros, promovendo uma gestão de risco adequada e um desempenho de trading consistente ao longo do tempo. Evita que traders dependam de um único dia de alto lucro para justificar saques, o que pode indicar uma estratégia de risco inadequada.
Cálculo e Aplicação:
Fórmula 1: Lucro do seu melhor dia / 0,40 = Lucro mínimo necessário para respeitar a regra. Exemplo: Se você fez $900 no seu melhor dia, precisa de pelo menos $2.250 em lucro total para estar em conformidade ($900 / 0,40).
Fórmula 2: Valor mínimo de saque x 0,40 = Lucro máximo diário permitido. Exemplo: Em uma conta de $50.000, onde você precisa de $2.600 para o primeiro saque, seu lucro diário máximo não deve exceder $1.040 ($2.600 x 0,40).
Gestão de Risco: Se você regularmente excede essa porcentagem de lucro em um único dia, pode ser um sinal de que sua gestão de risco não está alinhada com o tamanho da sua conta ou com as regras da plataforma. Ajustes na estratégia podem ser necessários para garantir uma abordagem mais sustentável.
Consistência: Para traders experientes que mantêm uma rotina de lucros diários consistentes ou se limitam a não exceder um lucro diário específico, a conformidade com essa regra não será problemática, pois a consistência é chave para o sucesso a longo prazo.
Lembre-se, após cada pedido de saque, a contagem para a regra dos 40% começa novamente, incentivando uma prática contínua de trading disciplinado e equilibrado.

Será possível utilizar a estratégia de "preço médio para trás" ao longo das operações na Ylos Trading?
Seta

Sim, é possível utilizar a estratégia de "preço médio para trás" na Ylos Trading, mas com algumas especificações dependendo do tipo de conta que você possui:

Contas Challenge: Na conta Challenge, o uso da estratégia de "preço médio para trás" é ilimitado. Isso significa que você pode aplicar essa técnica tantas vezes quanto necessário durante suas operações de trading dentro do período de avaliação.
Contas Master: Para as contas Master, há uma limitação no uso dessa estratégia. Você está limitado a fazer no máximo 3 médios para trás por operação. Isso é implementado para incentivar uma gestão de risco disciplinada e evitar que os traders aumentem excessivamente suas posições em momentos desfavoráveis.
A estratégia de "preço médio para trás" envolve comprar mais de um ativo que está depreciando em valor para reduzir o preço médio de compra, com a esperança de que o preço do ativo se recupere, resultando em um lucro quando vendido. No entanto, é uma estratégia de alto risco, pois aumenta a exposição ao mercado e pode levar a perdas significativas se o mercado continuar a se mover na direção contrária à esperada.

Qual a regra para operar notícias na Ylos Trading?
Seta

As regras para operar notícias na Ylos Trading variam dependendo do tipo de conta:

Contas Challenge:

Permitido: Você pode estar posicionado durante a divulgação de notícias. Isso significa que você pode manter posições abertas quando notícias econômicas ou eventos de mercado são anunciados.
Contas Master:

Proibido: Você não pode estar posicionado durante a divulgação de notícias. No entanto, você pode operar após o anúncio das notícias. Isso implica que todas as posições devem ser fechadas antes do evento de notícias e novas posições podem ser abertas somente após a notícia ter sido divulgada.
Explicação Adicional:

A regra para contas Master é estipulada para reduzir o risco associado à volatilidade extrema que pode ocorrer durante a publicação de notícias importantes. A intenção é promover uma prática de trading mais controlada e baseada em estratégias que não dependam exclusivamente de movimentos abruptos do mercado causados por notícias.
Operar Após Notícias: Para contas Master, após a notícia ser divulgada, você pode reagir com base na nova informação do mercado, respeitando todas as outras regras de trading da conta, como limites de drawdown, consistência operacional, entre outras.
Planejamento: É importante para ambos os tipos de conta ter um plano de trading que considere o calendário econômico, especialmente para contas Master, onde você precisa decidir se vai fechar posições antes das notícias ou esperar para operar com base na reação do mercado após o anúncio.
Volatilidade: Lembre-se que notícias podem causar movimentos de preço imprevisíveis. Mesmo que você possa operar durante notícias em contas Challenge, é essencial ter uma estratégia de gestão de risco para lidar com essa volatilidade.
Essas regras são projetadas para promover uma abordagem disciplinada e sustentável ao trading, enquanto ainda permite que os traders se beneficiem dos movimentos de mercado que ocorrem em resposta a novos eventos econômicos ou notícias.

Posso operar na abertura do mercado na Ylos Trading?
Seta

A regra para operar na abertura do mercado americano à vista varia dependendo do tipo de conta na Ylos Trading:

Contas Challenge:

Permitido: Você pode estar posicionado durante a abertura do mercado americano à vista, que ocorre às 9:30 AM (hora de Nova York). Assim como com as notícias, você tem liberdade para manter posições abertas durante a abertura do mercado.
Contas Master:

Proibido: Você não pode estar posicionado durante a abertura do mercado americano à vista. Similar à regra de notícias, para contas Master, você deve:
Antes da Abertura: Encerrar todas as operações em aberto antes da abertura do mercado à vista.
Após a Abertura: Só pode começar a operar após a abertura do mercado, inserindo novas ordens ou posições somente depois que o mercado estiver oficialmente aberto.
Explicação da Regra do P/L Drawdown na Ylos Trading
Seta

P/L Drawdown refere-se à regra de Proteção de Lucro e Limitação de Perdas que os traders da Ylos Trading devem seguir em suas contas Master. Esta regra é projetada para assegurar que um único trade não comprometa significativamente os lucros acumulados na conta, promovendo uma gestão de risco disciplinada e sustentável. Aqui está uma explicação detalhada:

Definição: O P/L Drawdown estipula que um único trade não pode resultar em uma perda que exceda 50% do lucro acumulado na conta.
Aplicação:
Colchão: A regra só é aplicada após você ter formado um "colchão" de segurança, que é um buffer de lucro que você acumulou na conta. Este colchão serve como uma reserva de lucro que protege sua conta de quedas abruptas no capital devido a uma operação mal-sucedida.
Objetivo:
Gestão de Risco: A regra do P/L Drawdown ajuda a evitar que os traders assumam riscos excessivos em uma única operação que poderia anular uma grande parte dos lucros já obtidos, promovendo uma abordagem mais conservadora e estratégica ao trading.
Sustentabilidade: Incentiva práticas de trading que visem crescimento consistente e longo prazo, em vez de tentar ganhos rápidos que possam colocar em risco o capital acumulado.
Exemplo Prático:
Suponha que você tenha uma conta Master com um saldo inicial de $50.000 e acumulou $5.000 em lucro. Como o valor acumulado é maior do que o seu colchão de segurança, a regra é aplicada. A regra do P/L Drawdown significa que você não pode perder mais do que $2.500 (50% de $5.000) em uma única operação.

Esta regra é fundamental para manter a integridade financeira da conta e para garantir que os traders operam com uma perspectiva de gestão de risco eficiente.

Explicação da Regra DCA (Médio para Trás) na Ylos Trading
Seta

DCA significa Dollar-Cost Averaging, que em português pode ser traduzido como "Médio para Trás" ou "Média de Custo em Dólares". No contexto da Ylos Trading, a regra DCA refere-se especificamente à prática de comprar mais de um ativo ou lote após uma queda de preço para reduzir o preço médio pago pelo lote total. Aqui está uma explicação detalhada da regra:

Definição:

A regra DCA na Ylos Trading diz respeito à quantidade de vezes que você pode "médiar para trás" em uma operação. Mediar para trás significa comprar mais de um ativo que está em perda para reduzir o custo médio da compra e potencializar lucros se o preço se recuperar.
A Regra:

Limitação: Você está limitado a fazer no máximo 3 médios para trás em uma única operação. Isso significa que, se você comprou uma posição e o preço caiu, você pode tentar reduzir seu custo médio comprando mais uma vez até três vezes adicionais, mas não mais do que isso.
Objetivo:

Gestão de Risco: A regra é estabelecida para evitar que os traders ampliem excessivamente suas posições em tentativas de recuperar perdas, o que poderia levar a perdas ainda maiores se o mercado continuasse a se mover na direção contrária. Ela incentiva uma abordagem mais controlada e disciplinada ao trading.
Funcionamento:

Primeira Compra: Você compra um ativo a um certo preço.
Preço Cai: Se o preço cai, você pode comprar mais para reduzir o preço médio da sua posição total, mas só pode fazer isso até 3 vezes:
Segundo Compra (1º médio para trás): Compra mais do ativo a um preço mais baixo.
Terceira Compra (2º médio para trás): Compra novamente se o preço continuar caindo.
Quarta Compra (3º médio para trás): Última compra permitida para médiar a posição.
Considerações:

Saídas Parciais: A regra se aplica independentemente de você fazer saídas parciais da posição. Se você vender parte da posição, ainda assim conta como um único trade para os propósitos desta regra.
Disciplina: A regra do DCA promove a disciplina, ensinando traders a não se deixarem levar pela esperança de recuperação de perdas a qualquer custo, mas sim a planejar suas entradas e saídas de forma estratégica.
Exemplo Prático:

Suponha que você comprou 1 contrato do Mini S&P500 a 4.500 pontos. O preço caiu para 4.450 pontos, e você compra outro contrato (1º médio para trás). O preço cai mais para 4.400 pontos, você compra um terceiro contrato (2º médio para trás). Se o preço cair para 4.350 pontos, você pode comprar um último contrato (3º médio para trás), mas não pode comprar mais além disso na mesma operação.

A regra DCA é uma importante ferramenta de gestão de risco para evitar que os traders aumentem excessivamente sua exposição ao mercado em busca de recuperar perdas.

Explicação da Regra de Risco x Retorno na Ylos Trading
Seta

A Regra de Risco x Retorno na Ylos Trading é uma diretriz que visa equilibrar o potencial de ganho com o risco de perda em cada operação de trading. A ideia é garantir que os traders não assumam riscos desproporcionais em relação ao possível retorno que uma operação pode oferecer. Aqui está uma explicação detalhada:

Definição:

A regra estipula que uma operação não deve ter uma expectativa de prejuízo superior a 5 vezes a mediana das operações ganhadoras. Isso significa que, para cada operação, o risco de perda deve ser gerenciado de tal forma que não exceda cinco vezes a mediana dos ganhos que você normalmente obtém de suas operações bem-sucedidas.
Como Funciona:

Relação de Risco: A regra diz que a quantidade máxima de perda aceitável (o risco) não deve ultrapassar 5 vezes a mediana dos seus ganhos de operações anteriores. Por exemplo, se a mediana dos seus ganhos é de $100, o risco máximo por operação seria $500 ($100 x 5).

Objetivo:

Gestão de Risco: A regra promove uma gestão de risco mais prudente, incentivando os traders a manterem um equilíbrio saudável entre o risco e o potencial de retorno. Isso ajuda a evitar cenários onde um único trade mal-sucedido poderia anular vários trades vencedores.

Aplicação Prática:

Definição de Stop-Loss: Ao entrar em uma operação, determine seu ponto de stop-loss (ponto onde você sairá da operação com uma perda) de maneira que a perda potencial não exceda 5 vezes a mediana de seus ganhos. Se você tem uma mediana de lucro de $100, seu stop-loss não deve permitir uma perda maior que $500 em uma operação.
Planejamento de Trade: Antes de cada operação, avalie se ela está dentro desta regra de risco. Isso pode influenciar a quantidade de contratos ou ações que você decide operar, bem como o posicionamento do stop-loss.

Considerações:

Ajuste Dinâmico: A mediana dos seus ganhos pode mudar ao longo do tempo, portanto, esta regra exige uma revisão contínua de suas operações passadas para manter uma gestão de risco eficaz.
Estratégia: A regra encoraja a criação de estratégias de trading que não apenas busquem altos retornos mas também considerem a possibilidade de perdas, mantendo-as dentro de limites seguros.

Essa regra é fundamental para a sustentabilidade das operações de trading, promovendo uma abordagem onde o risco é constantemente avaliado em função do retorno esperado, ajudando a preservar o capital e a acumular lucros consistentes ao longo do tempo.

Explicação da Regra de "Gambling" na Ylos Trading
Seta

A Regra de Gambling, ou "All In (Gambling)" na Ylos Trading, não proíbe diretamente o uso do limite máximo de contratos da conta, mas há uma distinção importante:

Definição e Aplicação:

Uso do Limite de Contratos: Embora não seja proibido utilizar o máximo de contratos permitidos pela conta, este uso deve ser consistente com o padrão normal de suas operações. Isso significa que se você ocasionalmente ou regularmente opera com contratos máximos como parte de sua estratégia de trading, isso é permitido desde que essa prática seja uma parte regular e documentada do seu plano de trading.
Proibição Específica: O que é proibido é usar o limite máximo de contratos em momentos de extrema volatilidade ou em situações que não estejam alinhadas com o comportamento histórico de suas operações, com o objetivo de obter ganhos rápidos. Por exemplo:
Momentos de Volatilidade: Se você normalmente opera com um volume moderado e de repente decide maximizar seu número de contratos durante um evento de notícias ou um período de alta volatilidade do mercado, isso pode ser visto como gambling, já que não é consistente com seu padrão de operações.
Inconsistência: Se o aumento para o uso do limite máximo não for parte da sua estratégia normal de trading, mas sim um movimento para tentar capitalizar sobre movimentos de mercado inesperados, isso é considerado uma prática de risco excessivo, similar ao jogo.
Objetivos:

Consistência: A regra visa promover uma prática de trading consistente e disciplinada, onde as decisões de tamanho de posição são baseadas em análise, gestão de risco e estratégia, e não em apostas de alto risco em busca de ganhos rápidos.
Gestão de Risco: Incentiva os traders a manter um equilíbrio entre risco e recompensa, evitando a exposição excessiva ao mercado que poderia resultar em perdas significativas.

Consequências da Violação:

Avaliação: Se a Ylos Trading notar um padrão de comportamento onde o uso do limite máximo de contratos não se alinha com a estratégia normal do trader, isso pode ser avaliado como gambling.
Sanções: Isso pode levar a uma revisão da conta, podendo resultar em advertências, suspensão de saques ou, em casos extremos, cancelamento da conta Master, dependendo da gravidade e da frequência da violação.

Resumo: A regra de gambling na Ylos Trading não é sobre o número de contratos operados per se, mas sobre como e quando esses contratos são utilizados. Deve haver uma coerência entre o tamanho das posições tomadas e a estratégia de trading habitual do trader, evitando o uso do limite máximo de contratos apenas em momentos de oportunidade percebida para ganhos rápidos.

Explicação da Regra de Consistência no Uso de Contratos na Ylos Trading
Seta

A Regra de Consistência no Uso de Contratos na Ylos Trading é uma diretriz que visa garantir que os traders operem de forma uniforme e estratégica ao longo do tempo, evitando comportamentos de trading que possam ser considerados manipulativos ou excessivamente especulativos. Aqui está uma explicação detalhada:

Definição:

A regra estipula que ajustes nos contratos são permitidos para adaptação ao mercado, mas não para estratégias de "all in" ou apenas para contar um dia como operado.
Aspectos da Regra:

Adaptação ao Mercado: Os traders podem ajustar o número de contratos que operam de acordo com as condições de mercado, estratégias de risco e gestão de capital. Isso pode incluir aumentar ou diminuir o tamanho das posições com base em análises técnicas, fundamentais, ou mudanças na volatilidade do mercado.
Proibição de "All In": É proibido usar o máximo de contratos permitidos pela conta de maneira inconsistente com o padrão de operações normais do trader, especialmente na tentativa de obter ganhos rápidos em momentos de alta volatilidade, como foi explicado na regra de gambling.
Contagem de Dias Operados: Ajustar o número de contratos apenas para garantir que um dia seja contado como operado (para cumprir requisitos de atividade ou saque) é proibido. Isso significa que a operação deve ser genuína e parte da estratégia de trading, não uma manobra para atender a regras de desempenho ou atividade.

Objetivos:

Consistência: Promover um padrão de trading consistente onde o tamanho das posições reflete uma abordagem estratégica e não oscilações aleatórias ou tentativas de manipulação para atender critérios de performance.
Gestão de Risco: Incentivar práticas de gestão de risco onde o tamanho das posições é decidido com base em uma avaliação contínua do mercado e da estratégia, não em momentos oportunistas ou reações impulsivas.
Integridade do Trading: Garantir que os traders estão operando com intenção genuína de trading, e não apenas para cumprir regras ou explorar o sistema.
Explicação da Regra de Hedging na Ylos Trading
Seta

A Regra de Hedging na Ylos Trading é estabelecida para garantir que os traders não utilizem táticas que possam manipular ou distorcer a verdadeira performance de trading. Aqui está uma explicação detalhada:

Definição:

Hedging: No contexto de trading, hedging é a prática de abrir posições em sentidos opostos para mitigar riscos. No entanto, na Ylos Trading, a regra de hedging tem uma conotação específica:

Regra:

Proibição de Hedging: É proibido operar posições contrárias em contas diferentes simultaneamente. Isso significa que você não pode, por exemplo, ter uma posição comprada em uma conta e uma venda no mesmo ativo em outra conta ao mesmo tempo.
Hedging em Ativos Similares: Também é considerado hedging o uso de posições contrárias em ativos similares, como comprar um ativo em uma conta enquanto vende um ativo correlacionado em outra conta, com o objetivo de reduzir ou eliminar o risco de mercado.
Proibição de Flipping: Também está proibido operar de forma diferente apenas para contar um dia como operado. Isso inclui abrir e fechar posições rapidamente ou de maneira que não reflete a estratégia normal e disciplinada do trader, apenas para cumprir requisitos de atividade ou saque.

Objetivos:

Integridade do Trading: A regra visa manter a integridade das operações de trading, garantindo que as posições abertas reflitam verdadeiramente a estratégia de mercado do trader e não sejam usadas para manipular resultados ou para atender a critérios de desempenho de maneira artificial.
Consistência: Promove uma abordagem consistente ao trading, onde cada operação é parte de uma estratégia coerente e não de tentativas de manipulação ou hedging para reduzir artificialmente o risco ou inflar a performance.
Transparência: Evita práticas que poderiam mascarar a verdadeira exposição ao mercado, garantindo que os resultados de trading reflitam a habilidade e a estratégia do trader.

Aplicação Prática:

Estratégia Genuína: Cada operação deve ser parte de uma estratégia de trading bem definida. Se um trader deseja proteger seu portfólio, isso deve ser feito de maneira consistente e transparente dentro de uma única conta, sem recorrer a múltiplas contas para posições contrárias ou em ativos similares.
Monitoramento: A Ylos Trading monitora as atividades para detectar padrões de hedging ou flipping. Se tais práticas forem identificadas, a empresa pode tomar medidas.

Consequências da Violação:

Revisão e Ação: Se um trader for pego violando a regra de hedging, pode haver uma revisão da conta. Consequências podem incluir:
Advertências ou suspensão temporária da conta.
Cancelamento da Conta Master, especialmente se o comportamento for repetitivo ou intencional.
Perda de saques ou anulação de lucros obtidos através de práticas proibidas.

Resumo: A regra de hedging na Ylos Trading não impede o uso de estratégias de proteção de risco dentro de uma única conta, mas proíbe o uso de múltiplas contas para abrir posições contrárias simultaneamente ou operar de maneira inconsistente apenas para manipular critérios de performance ou atividade de trading. Isso inclui o uso de ativos similares para criar uma posição hedged entre contas diferentes. Essa regra encoraja um ambiente de trading onde a habilidade e a estratégia do trader são os determinantes do sucesso, não a manipulação do sistema.

O que é Flipping?
Seta

Flipping é definido como a prática de realizar uma negociação apenas para que possa ser contada como um "dia de negociação" para cumprir os requisitos de pagamento, sem que essa negociação esteja alinhada com a estratégia diária normal, disciplinada e consistente do trader. Em outras palavras, é fazer uma operação de compra e venda de um ativo sem a intenção genuína de seguir uma estratégia de trading, mas sim apenas para registrar um dia de trading ativo.

Essa prática pode ser questionada pela Ylos, que pode exigir que o trader forneça provas mostrando as regras exatas usadas para a entrada da negociação em questão, bem como evidências de entradas de dias anteriores que sigam as mesmas regras do plano de trade, para demonstrar que a operação não foi um "flip", mas sim parte da estratégia normal e consistente de trading.

A Ylos Trading busca evitar práticas que não contribuam para um crescimento consistente e sustentável, focando em traders que operem de maneira disciplinada e alinhada com um plano de trading claro e consistente, evitando manipulações ou abusos do sistema de financiamento.

Como é calculado o saldo da conta Master na Ylos Trading?
Seta

O saldo da conta Master começa com o valor inicial da conta ao passar da Conta Challenge para a Conta Master (por exemplo, US$ 25k, US$ 50k). Este saldo é ajustado diariamente com base nos lucros e perdas das operações de trading. Lucros aumentam o saldo, enquanto perdas o diminuem, mas há um limite de perda conhecido como drawdown que não pode ser excedido para manter a conta ativa. Para contas Master, o drawdown é do tipo trailing, ajustado em tempo real até atingir um certo nível de lucro, após o qual se torna estático. Taxas de corretagem (US$ 0,52 por micro contrato e US$ 1,55 por mini contrato) são deduzidas do saldo por cada operação. Para lucros acima de US$ 15.000, uma comissão de 10% é aplicada sobre o lucro adicional, mas isso afeta diretamente o que pode ser sacado, não o saldo acumulado da conta.

Onde posso ver meu saldo atualizado?
Seta

Você pode ver seu saldo atualizado no painel de controle após fazer login no site da Ylos Trading, onde encontrará informações detalhadas sobre seu saldo, lucros, perdas e outras métricas relevantes. A plataforma de trading BlackArrow, fornecida pela Nelogica, também mostra em tempo real suas posições abertas, e lucros/perdas acumulados durante a sessão de trading, porém o BlackArrow não desconta automaticamente a corretagem.

Quais são as taxas de corretagem cobradas pela Ylos para operar minis e micro contratos?
Seta

Para operações na Ylos Trading, as taxas de corretagem são as seguintes:

Micro Contrato: A taxa é de US$0,52 por cada micro contrato negociado.
Mini Contrato: A taxa é de US$1,55 por cada mini contrato negociado.

Explicação:

Operação: Uma operação é definida como uma entrada e uma saída de um mesmo ativo. Isso significa que, para cada operação, você está negociando efetivamente dois contratos - um para comprar e outro para vender.
Exemplos:

Mini Contrato:
Se você compra 1 mini contrato e depois vende o mesmo contrato para sair da operação com um lucro de 3 pontos, você efetivamente negociou dois mini contratos (um na compra e outro na venda).
Com a taxa de US$1,55 por mini contrato, o custo total da operação seria US$3,10 (US$1,55 x 2).
Micro Contrato:
Utilizando o mesmo exemplo, se você compra 1 micro contrato e depois vende o mesmo para sair da operação com um lucro de 3 pontos, você também negociou dois micro contratos (um na compra e outro na venda).
Com a taxa de US$0,52 por micro contrato, o custo total da operação seria US$1,04 (US$0,52 x 2).
Quais são as comissões cobradas pela Ylos Trading?
Seta

Contas Challenge:

Não há cobrança alguma. As contas Challenge são contas de avaliação onde o trader demonstra suas habilidades sem a incidência de comissões.
Contas Master:
As comissões para contas Master variam com base no lucro acumulado:

Lucros de até $15.000,00:
Comissão para a mesa: 0%
Lucro para o trader: 100%
Lucros a partir de $15.000,00:
Comissão para a mesa: 10%
Lucro para o trader: 90%
Como funcionará o processo de saque na Ylos Trading?
Seta

O processo de saque na Ylos Trading para contas Master é detalhado e segue estas etapas:

Elegibilidade para Saque:
Para solicitar um saque, você deve ter operado pelo menos 10 dias no mês, com pelo menos 7 dias vencedores (um dia vencedor é aquele que termina com ganhos de no mínimo $50,00).
Deve-se manter o saldo na conta acima do valor do drawdown mais $100,00. Por exemplo, para uma conta de $50.000, o saldo mínimo deve ser $52.600.
Pedido de Saque:
No seu painel de controle, você encontrará a opção para solicitar um saque. Preencha os detalhes necessários, incluindo o valor que deseja sacar.
Limites e Percentuais de Saque:
Nos primeiros 4 saques, há um limite pré-definido. Após isso, você pode sacar 100% do valor disponível acima do colchão.
Você pode sacar 100% dos primeiros $15.000 de lucro e 90% do lucro subsequente.
Confirmação e Processamento:
Após o pedido, a Ylos Trading tem até 3 dias úteis para confirmar ou reprovar o saque.
Após a aprovação, o pagamento será liberado em até 5 dias úteis. A transferência dos valores será feita por uma empresa habilitada nos EUA, que também enviará um invoice (comprovante de pagamento) válido para fins fiscais no mundo todo.
Bloqueio de Conta e Saque:
A conta não fica bloqueada durante o processo de saque; entretanto, o valor solicitado é imediatamente retirado da sua conta. Se o saque for rejeitado, o valor é devolvido à conta.
Se a conta for quebrada (atingir o drawdown máximo) entre o pedido e o pagamento do saque, o pedido de saque será cancelado.
Saques do Colchão:
Nos primeiros 4 saques, você pode sacar até 50% do colchão. Após esses 4 saques, você pode sacar sem limite de teto, mas não pode mais sacar do colchão. O restante do colchão só pode ser sacado ao ser promovido para uma conta Broker.

Janelas de Saque:
Não há mais "janelas de saque"; basta seguir as regras de operação e saque para que seu pedido seja liberado.
Quando posso solicitar um saque na Ylos Trading?
Seta

Para solicitar um saque na Ylos Trading, você deve cumprir uma série de critérios específicos associados à sua conta Master. Aqui estão os detalhes sobre quando e como você pode solicitar um saque:

Operação Mínima:
Você precisa ter operado por pelo menos 10 dias no mês. Isso significa que você deve ter realizado operações de trading nesses dias para ser elegível para um pedido de saque.
Dias Vencedores:
Dentro desses 10 dias operados, pelo menos 7 dias devem ser vencedores. Um dia vencedor é definido como aquele que termina com um ganho líquido de pelo menos $50,00 na conta.
Saldo Mínimo:
O saldo da sua conta deve estar acima do valor do drawdown mais $100,00. Por exemplo, se sua conta tem um drawdown de $2.500, o saldo mínimo para solicitar um saque seria $52.600 para uma conta de $50.000.
Período de Saque:
Não há janelas específicas de saque. Você pode solicitar um saque a qualquer momento, desde que cumpra os critérios anteriores. A flexibilidade é dada para que os traders possam gerenciar seus lucros de acordo com sua estratégia financeira.
Processo de Solicitação:
A solicitação de saque é feita através do seu painel de controle na plataforma Ylos Trading. Basta clicar na opção de saque, inserir o valor desejado e preencher qualquer informação adicional necessária.
Limites e Percentuais:
Nos primeiros 4 saques, há um limite pré-definido. Após isso, você pode sacar 100% do valor disponível acima do colchão (capital de segurança).
Para os primeiros $15.000 de lucro, você pode sacar 100%. Para lucros acima desse valor, você pode sacar 90%.

Tempo de Processamento:
Após solicitar o saque, a Ylos Trading tem até 3 dias úteis para confirmar ou reprovar o pedido. Após a confirmação, o pagamento será liberado em até 5 dias úteis. A transferência dos valores será feita por uma empresa habilitada nos EUA, que também enviará um invoice (comprovante de pagamento) válido para fins fiscais no mundo todo.
Regras Adicionais:
Se sua conta for quebrada (atingir o drawdown máximo) entre o pedido de saque e o pagamento, o pedido de saque será cancelado.
A conta não fica bloqueada após o pedido de saque, mas o valor solicitado é retirado da conta no momento da solicitação. Se o saque for rejeitado, o valor é devolvido.
Saques do Colchão:
Você pode sacar até 50% do colchão nos primeiros 4 saques. Após isso, pode-se sacar sem limite de teto, mas não pode mais sacar do colchão. O restante do colchão só pode ser sacado ao ser promovido para uma conta Broker.
Compreender e aderir a essas regras garante que você possa aproveitar seus lucros de forma eficiente e segura.

Quanto posso sacar da minha conta Master na Ylos Trading?
Seta

A quantidade que você pode sacar da sua conta Master na Ylos Trading depende de várias regras e condições:

Saque Mínimo:

O saque mínimo para contas de qualquer tamanho é de US$ 500.

Limites Iniciais de Saque (Primeiros 4 Saques):

Conta de US$ 25k: Máximo de US$ 1.500 por saque.
Conta de US$ 50k: Máximo de US$ 2.000 por saque.
Conta de US$ 100k: Máximo de US$ 2.500 por saque.
Conta de US$ 150k: Máximo de US$ 2.750 por saque.
Conta de US$ 250k: Máximo de US$ 3.000 por saque.
Conta de US$ 300k: Máximo de US$ 3.500 por saque.

Após os Primeiros 4 Saques:

Você pode sacar 100% do valor disponível acima do "colchão" (um buffer de segurança). No entanto, há uma comissão aplicada:
Lucros até US$ 15.000: Você pode sacar 100% do lucro.
Lucros acima de US$ 15.000: Você pode sacar 90% do lucro, com 10% retidos como comissão para a Ylos.
Quanto preciso ter em conta para poder solicitar o saque na Ylos Trading?
Seta

Para solicitar um saque na Ylos Trading, você precisa manter um saldo mínimo específico na sua conta Master, que deve ser igual ao valor do drawdown mais US$ 100. Aqui estão os valores para cada tamanho de conta:

Conta de US$ 25k: US$ 26.600
Conta de US$ 50k: US$ 52.600
Conta de US$ 100k: US$ 103.100
Conta de US$ 150k: US$ 155.100
Conta de US$ 250k: US$ 256.600
Conta de US$ 300k: US$ 307.600

Observações:
Drawdown: O drawdown é o valor máximo de perda permitido na conta. Por exemplo, para uma conta de US$ 50.000, o drawdown pode ser de US$ 2.500, então o saldo mínimo para solicitar um saque seria US$ 52.600 (US$ 50.000 - US$ 2.500 + US$ 100).

Como serei pago pela Ylos?
Seta

Você será pago pela Ylos Trading através de um invoice, que é um Recibo de Pagamento Autônomo individual. Não será fornecido nenhum relatório contábil ou fiscal juntamente com o pagamento.

Importante:

Aconselhamento Fiscal: Para qualquer dúvida ou aconselhamento sobre questões fiscais, é recomendado que você entre em contato com seu contador. A Ylos Trading não oferece consultoria tributária e não pode responder perguntas relacionadas a impostos, registros, questões de cidadania, vistos de trabalho ou quaisquer outras questões fiscais.

Suporte: O suporte da YLOS também não dispõe de informações ou assistência sobre impostos e declarações relacionadas aos lucros obtidos durante sua parceria com a Ylos.

Portanto, para questões específicas sobre como esses pagamentos afetam sua situação fiscal, consulte um profissional especializado.

Consigo sacar os ganhos que obtive na conta teste na Ylos Trading?
Seta

Não, você não pode sacar os ganhos obtidos na conta teste, conhecida como Conta Challenge, na Ylos Trading. A Conta Challenge é uma fase de avaliação onde você demonstra suas habilidades de trading com capital virtual, não real, para provar que pode operar de forma lucrativa e disciplinada conforme as regras da Ylos. Os ganhos que você obtém nessa conta são apenas parte de um saldo virtual, uma simulação para testar suas estratégias, e não representam dinheiro que pode ser retirado. Para sacar lucros, você precisa passar para uma Conta Master após atingir os critérios da Conta Challenge.

Como resolver problemas de compra na Ylos Trading? Com quem eu devo falar?
Seta

Se você está enfrentando problemas com sua compra na Ylos Trading, siga estes passos para resolução e saiba com quem entrar em contato:

Verifique o FAQ: Primeiramente, consulte a seção de Perguntas Frequentes (FAQ) no site da Ylos Trading. Muitas vezes, questões comuns sobre compras, pagamentos, ou ativação de contas são abordadas lá.

E-mail de Suporte: Se o FAQ não resolve seu problema, envie um e-mail para support@ylostrading.com (mailto:support@ylostrading.com). Este é o canal oficial de suporte ao cliente da Ylos Trading para questões de compra. Inclua no e-mail:
Seu nome completo
E-mail associado à conta
Detalhes específicos do problema (número de pedido, data da compra, método de pagamento, etc.)
Qualquer captura de tela ou detalhe adicional que possa ajudar a resolver o problema
Chat ao Vivo: A Ylos Trading também oferece um chat ao vivo em seu site. Verifique na página se o chat está disponível:
Hora de funcionamento: Normalmente, o chat ao vivo funciona de 9:30 a.m. até 18:00 p.m. (horário de Brasília), de segunda a domingo. No entanto, confirme no site, pois esses horários podem mudar.

Recomendações:

Mantenha Registros: Guarde cópias de todos os e-mails enviados e recebidos, bem como quaisquer evidências de pagamento ou comunicação com a Ylos Trading.
Seja Paciente: Às vezes, devido ao volume de solicitações, pode haver um pequeno atraso na resposta. No entanto, se você não receber uma resposta dentro de um período razoável (normalmente 24 a 48 horas, excluindo fins de semana), considere enviar um lembrete.
Documentação: Se o problema for relacionado a uma transação financeira, tenha à mão todos os detalhes do pagamento para facilitar a resolução.
Nota: Sempre use canais oficiais de comunicação para evitar cair em fraudes ou esquemas de phishing. Nunca compartilhe informações sensíveis como senhas ou dados bancários através de e-mails não solicitados ou links suspeitos.

Quais horários posso operar na Ylos Trading?
Seta

Para operar na Ylos Trading, você deve considerar os horários de funcionamento da Chicago Mercantile Exchange (CME) Globex, com algumas especificações devido às regras da plataforma:
Horário de Operação Globex:
Abertura: 17:00 PM (hora de Chicago) de domingo.
Fechamento: 16:00 PM (hora de Chicago) de sexta-feira, com uma pausa diária de uma hora de 16:00 PM a 17:00 PM.
Especificações para Ylos Trading:
Dia Operado: Para ser considerado um dia operado na Ylos, você deve realizar pelo menos uma operação dentro do período de um dia de trading Globex. No entanto:

Proibição de Overnight e Swing Trading: Todas as operações devem ser abertas e fechadas dentro do mesmo dia de trading. Isso significa que:

Horário Efetivo para Operação: Embora o Globex esteja aberto 24/5, na Ylos Trading, você pode operar de 17:00 PM de um dia até antes das 16:00 PM do dia seguinte, mas cada operação deve ser concluída dentro desse período para não ser considerada overnight ou swing trading.

Ajuste de Fuso Horário: Se você está fora do fuso horário de Chicago, ajuste esses horários. Por exemplo, para o horário de Brasília (BRT), durante o horário padrão, a abertura seria às 20:00 PM e o fechamento às 19:00 PM do dia seguinte.
Posso fazer operações de overnight ou swing trade na Ylos Trading?
Seta

Não, não é permitido realizar operações de overnight ou swing trade na Ylos Trading. Aqui estão algumas explicações sobre isso:

Overnight Trading:
Proibido: Todas as posições devem ser fechadas antes do encerramento do dia de trading.
Swing Trading:
Proibido: O swing trading, que envolve manter posições por vários dias, também não é permitido. A estratégia de trading na Ylos deve ser baseada em operações intradiárias, onde as posições são abertas e fechadas dentro do mesmo dia de trading.
Qual é o prazo que eu tenho para ativar a conta Master na Ylos Trading?
Seta

Você tem 30 dias corridos a partir da data de aquisição da Conta Challenge para efetuar o pagamento da taxa de ativação e ativar sua Conta Master.

Exemplo:
Se você comprou sua Conta Challenge há 20 dias e foi aprovado para a conta Master, você tem até 10 dias restantes para pagar a taxa de ativação e converter sua conta.

Importante:

Aprovação e Notificação: Quando você é aprovado, recebe uma notificação para ativar a conta Master. No entanto, o prazo de 30 dias começa a contar a partir da data de compra da Conta Challenge, não da data de aprovação.

Pagamento da Taxa: O pagamento da taxa de ativação é necessário para a conversão da conta. Sem esse pagamento dentro do prazo, a conta não será ativada como Master.

Ativação: Após o pagamento, a ativação geralmente ocorre imediatamente ou dentro de um curto período.

Explicar

[exemplo de csv com relatorio]
Conta: 52256
Titular: 50K Funded [d6421124] Ylos Trading - Leonardo Bonf
Data Inicial: 01/06/2025
Data Final: 05/06/2025
Ativo Abertura Fechamento Tempo Operação Qtd Compra Qtd Venda Lado Preço Compra Preço Venda Preço de Mercado Médio Res. Intervalo Res. Intervalo (%) Res. Operação Res. Operação (%) TET Total
ESFUT 04/06/2025 06:41 04/06/2025 07:21 39min53s 3 3 V 5.990,25 5.992,50 5.986,00 Não 337,5 0,04 337,5 0,04 - 337,5
ESFUT 04/06/2025 07:24 04/06/2025 07:24 36s 3 3 C 5.990,00 5.990,75 5.986,00 Não 112,5 0,01 112,5 0,01 43min4s 450
ESFUT 04/06/2025 08:45 04/06/2025 09:15 29min46s 4 4 V 5.992,00 5.992,75 5.986,00 Sim 150 0,01 150 0,01 1h20min59s 600
ESFUT 04/06/2025 15:02 04/06/2025 15:08 6min38s 2 2 V 5.995,00 5.997,00 5.986,00 Sim 200 0,03 200 0,03 6h16min50s 800
ESFUT 05/06/2025 07:13 05/06/2025 07:35 22min21s 4 4 V 5.986,75 5.988,00 5.986,00 Não 250 0,02 250 0,02 16h11min23s 1.050,00
ESFUT 05/06/2025 07:41 05/06/2025 08:32 51min6s 4 4 C 5.981,38 5.982,50 5.986,00 Sim 225 0,02 225 0,02 28min19s 1.275,00
ESFUT 05/06/2025 10:58 05/06/2025 10:59 1min43s 1 1 C 5.959,50 5.962,75 5.986,00 Sim 162,5 0,05 162,5 0,05 3h16min20s 1.437,50
ESFUT 05/06/2025 11:00 05/06/2025 11:02 1min54s 2 2 V 5.962,25 5.964,75 5.986,00 Não 250 0,04 250 0,04 2min32s 1.687,50

[PENSEI EM UTILIZARMOS UMA API PARA VERIFICAR SE O USUARIO ESTAVA OPERANDO DURANTE NOTICIAS, ABAIXO IREI DEIXAR UM PSEUDOCODIGO PARA QUE VOCE TENHA UMA BASE DA IDEIA
[import pandas as pd
import requests
from datetime import datetime, timedelta
import pytz

# Carregar o CSV

csv_data = pd.read_csv("operations.csv", sep="\t")

# Configurar API Finnhub

api_key = "d10s8tpr01qse6ldnu40d10s8tpr01qse6ldnu4g"
url = f"https://finnhub.io/api/v1/calendar/economic?from=2025-06-04&to=2025-06-05&token={api_key}"
response = requests.get(url)
events = response.json().get("economicCalendar", [])
high_impact_events = [event for event in events if event["impact"] == "high"]

# Configurar fusos horários

csv_timezone = pytz.timezone("America/Sao_Paulo") # -03 BRT
ny_timezone = pytz.timezone("America/New_York") # -04 DST

# Função para converter horário do CSV para NY time

def to_ny_time(dt_str, csv_tz, ny_tz):
dt = datetime.strptime(dt_str, "%d/%m/%Y %H:%M")
dt = csv_tz.localize(dt)
return dt.astimezone(ny_tz)

# Verificar infrações

infractions = []
for \_, row in csv_data.iterrows():
start_time = to_ny_time(row["Abertura"], csv_timezone, ny_timezone)
duration = row["Tempo Operação"]
if "min" in duration:
minutes, seconds = map(int, duration.replace("min", "").replace("s", "").split())
end_time = start_time + timedelta(minutes=minutes, seconds=seconds)
else:
seconds = int(duration.replace("s", ""))
end_time = start_time + timedelta(seconds=seconds)

    for event in high_impact_events:
        event_time = datetime.strptime(event["date"], "%Y-%m-%d %H:%M:%S")
        event_time = ny_timezone.localize(event_time)
        window_start = event_time - timedelta(minutes=5)
        window_end = event_time + timedelta(minutes=5)

        if start_time <= window_end and end_time >= window_start:
            infractions.append({
                "operation_start": row["Abertura"],
                "ny_start": start_time.strftime("%Y-%m-%d %H:%M:%S %Z"),
                "event": event["event"],
                "event_time": event["date"]
            })

# Relatar infrações

if infractions:
for infraction in infractions:
print(f"Infração: Operação em {infraction['operation_start']} ({infraction['ny_start']}) coincide com {infraction['event']} às {infraction['event_time']}.")
else:
print("Nenhuma infração relacionada a notícias encontrada.")]
