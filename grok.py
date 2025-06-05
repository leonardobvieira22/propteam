import pandas as pd
import io
import sys
from datetime import datetime, timedelta
import pytz
import re

# Data e hora atuais fornecidas pelo sistema
CURRENT_DATE_TIME = datetime.strptime("05/06/2025 01:52", "%d/%m/%Y %H:%M")
CURRENT_TIMEZONE = pytz.timezone("America/Sao_Paulo")  # -03 BRT
CURRENT_DATE_TIME = CURRENT_TIMEZONE.localize(CURRENT_DATE_TIME)

# Função para converter horário do CSV para NY time
def to_ny_time(dt_str, csv_tz, ny_tz):
    dt = datetime.strptime(dt_str, "%d/%m/%Y %H:%M")
    dt = csv_tz.localize(dt)
    return dt.astimezone(ny_tz)

# Função para calcular a duração de uma operação em segundos
def parse_duration(duration_str):
    if "min" in duration_str:
        minutes, seconds = map(int, duration_str.replace("min", "").replace("s", "").split())
        return minutes * 60 + seconds
    else:
        return int(duration_str.replace("s", ""))

# Função para verificar se uma operação coincide com um evento
def check_time_overlap(start_time, end_time, event_start, event_end):
    return start_time <= event_end and end_time >= event_start

# Função para calcular a mediana de uma lista
def calculate_median(values):
    sorted_values = sorted(values)
    n = len(sorted_values)
    mid = n // 2
    if n % 2 == 0:
        return (sorted_values[mid - 1] + sorted_values[mid]) / 2
    return sorted_values[mid]

# Função para fazer perguntas ao usuário
def get_user_input():
    print("\nBem-vindo ao Sistema de Análise de Operações da Ylos Trading!")
    print("Por favor, responda às perguntas abaixo para realizar a análise.\n")

    # Pergunta 1: Tipo de conta
    while True:
        print("1. Qual é o tipo da sua conta? (Digite o número correspondente)")
        print("[1] Conta Master Funded")
        print("[2] Conta Instant Funding")
        account_type = input("Resposta: ")
        if account_type in ["1", "2"]:
            account_type = "Master Funded" if account_type == "1" else "Instant Funding"
            break
        print("Opção inválida. Por favor, digite 1 ou 2.")

    # Pergunta 2: Saldo atual
    while True:
        print("\n2. Qual é o seu saldo atual (em USD)?")
        print("Exemplo: 51616.20")
        try:
            current_balance = float(input("Resposta: "))
            if current_balance >= 0:
                break
            print("Saldo deve ser um número não negativo.")
        except ValueError:
            print("Por favor, insira um número válido.")

    # Pergunta 3: Fuso horário do CSV
    while True:
        print("\n3. Qual é o fuso horário das operações no relatório CSV?")
        print("Exemplo: -03 (BRT), -04 (NY com DST), -05 (NY sem DST)")
        print("Digite o fuso horário no formato UTC (ex.: -03 para BRT): ")
        csv_timezone_str = input("Resposta: ")
        if re.match(r"^[+-]\d{2}$", csv_timezone_str):
            if csv_timezone_str == "-03":
                csv_timezone = pytz.timezone("America/Sao_Paulo")
            elif csv_timezone_str == "-04":
                csv_timezone = pytz.timezone("America/New_York")
            elif csv_timezone_str == "-05":
                csv_timezone = pytz.timezone("America/New_York")
            else:
                print("Fuso horário não suportado. Usando -03 (BRT) como padrão.")
                csv_timezone = pytz.timezone("America/Sao_Paulo")
            break
        print("Formato inválido. Use ex.: -03")

    # Pergunta 4: Número de saques
    while True:
        print("\n4. Quantos saques você já realizou nesta conta?")
        print("Exemplo: 0, 1, 2, 3, 4 ou mais")
        try:
            num_withdrawals = int(input("Resposta: "))
            if num_withdrawals >= 0:
                break
            print("Número de saques deve ser não negativo.")
        except ValueError:
            print("Por favor, insira um número inteiro válido.")

    return account_type, current_balance, csv_timezone, num_withdrawals

# Função principal para análise
def analyze_operations():
    # Obter inputs do usuário
    account_type, current_balance, csv_timezone, num_withdrawals = get_user_input()

    # Determinar parâmetros com base no tipo de conta
    if account_type == "Master Funded":
        min_days_operated = 10
        min_winning_days = 7
        min_winning_amount = 50.00
        consistency_limit = 0.40
    else:  # Instant Funding
        min_days_operated = 5
        min_winning_days = 5
        min_winning_amount = 200.00
        consistency_limit = 0.30

    # Obter o CSV do usuário
    print("\nPor favor, copie e cole o conteúdo do seu CSV abaixo (incluindo o cabeçalho).")
    print("Quando terminar, pressione Enter duas vezes para continuar.")
    lines = []
    while True:
        line = input()
        if line == "":
            break
        lines.append(line)

    # Criar um DataFrame a partir do CSV
    csv_content = "\n".join(lines)
    try:
        df = pd.read_csv(io.StringIO(csv_content), sep="\t")
    except Exception as e:
        print(f"Erro ao ler o CSV: {e}")
        sys.exit(1)

    # Corrigir erros no CSV (ex.: data incorreta "04/08/2025" para "04/06/2025")
    df["Abertura"] = df["Abertura"].str.replace("04/08/2025", "04/06/2025")
    df["Fechamento"] = df["Fechamento"].str.replace("04/08/2025", "04/06/2025")

    # Extrair informações do CSV
    account_size = 50000  # Assumido como 50K com base no CSV
    drawdown = 2500  # Drawdown padrão para 50K
    min_balance_for_withdrawal = account_size - drawdown + 100  # 52,600 para 50K

    # Calcular dias operados e dias vencedores
    df["Date"] = df["Abertura"].apply(lambda x: x.split()[0])
    daily_profits = df.groupby("Date")["Res. Operação"].sum().reset_index()
    days_operated = len(daily_profits)
    winning_days = len(daily_profits[daily_profits["Res. Operação"] >= min_winning_amount])

    # Calcular lucro total no período do CSV
    total_profit_csv = df["Res. Operação"].sum()

    # Calcular corretagem
    total_contracts = (df["Qtd Compra"] + df["Qtd Venda"]).sum()
    brokerage_fee_per_contract = 1.55  # Para contratos mini (ESFUT)
    total_brokerage = total_contracts * brokerage_fee_per_contract

    # Verificar saldo mínimo para saque
    balance_meets_requirement = current_balance >= min_balance_for_withdrawal

    # Verificar regra de consistência
    max_day_profit = daily_profits["Res. Operação"].max()
    consistency_percentage = (max_day_profit / total_profit_csv) if total_profit_csv > 0 else 0
    consistency_violation = consistency_percentage > consistency_limit

    # Verificar P/L Drawdown
    accumulated_profit = current_balance - account_size + total_brokerage
    pl_drawdown_limit = accumulated_profit * 0.5
    max_loss_per_trade = df["Res. Operação"].min()
    pl_drawdown_violation = max_loss_per_trade < -pl_drawdown_limit if accumulated_profit > 0 else False

    # Verificar Risco x Retorno
    winning_trades = df[df["Res. Operação"] > 0]["Res. Operação"].tolist()
    median_winning_trade = calculate_median(winning_trades) if winning_trades else 0
    max_loss_limit = median_winning_trade * 5
    risk_return_violation = max_loss_per_trade < -max_loss_limit if winning_trades else False

    # Verificar DCA (Médio para Trás)
    dca_violations = []
    for idx, row in df.iterrows():
        if row["Médio"] == "Sim":
            dca_violations.append(f"Operação em {row['Abertura']}: Possível violação de DCA (máximo 3 médios). Confirme o número de médios realizados.")

    # Verificar posicionamento durante abertura do mercado (9:30 AM NY)
    NY_TIMEZONE = pytz.timezone("America/New_York")
    market_open_violations = []
    for idx, row in df.iterrows():
        start_time = to_ny_time(row["Abertura"], csv_timezone, NY_TIMEZONE)
        duration_seconds = parse_duration(row["Tempo Operação"])
        end_time = start_time + timedelta(seconds=duration_seconds)

        market_open_time = start_time.replace(hour=9, minute=30, second=0, microsecond=0)
        market_open_start = market_open_time - timedelta(minutes=5)
        market_open_end = market_open_time + timedelta(minutes=5)

        if check_time_overlap(start_time, end_time, market_open_start, market_open_end):
            market_open_violations.append(f"Operação em {row['Abertura']} ({start_time.strftime('%H:%M:%S %Z')}) coincide com a abertura do mercado às 9:30 AM NY.")

    # Verificar overnight/swing trading
    overnight_violations = []
    for idx, row in df.iterrows():
        start_date = row["Abertura"].split()[0]
        end_date = row["Fechamento"].split()[0]
        if start_date != end_date:
            overnight_violations.append(f"Operação em {row['Abertura']} é overnight (iniciou em {start_date} e terminou em {end_date}).")

    # Verificar inatividade
    last_operation = df["Fechamento"].max()
    last_operation_time = to_ny_time(last_operation, csv_timezone, CURRENT_TIMEZONE)
    inactivity_days = (CURRENT_DATE_TIME - last_operation_time).days
    inactivity_violation = inactivity_days > 30

    # Verificar hedging, flipping, gambling (simplificado)
    contract_variation = df["Qtd Compra"].std()
    gambling_warning = contract_variation > df["Qtd Compra"].mean() * 0.5 if len(df) > 1 else False

    # Determinar elegibilidade para saque
    eligible_for_withdrawal = (
        days_operated >= min_days_operated and
        winning_days >= min_winning_days and
        balance_meets_requirement and
        not consistency_violation and
        not pl_drawdown_violation and
        not risk_return_violation and
        not dca_violations and
        not market_open_violations and
        not overnight_violations and
        not inactivity_violation
    )

    # Calcular limite de saque
    if num_withdrawals < 4:
        withdrawal_limit = 2000  # Para 50K
    else:
        withdrawal_limit = current_balance - (account_size - drawdown)
        if accumulated_profit > 15000:
            withdrawal_limit = withdrawal_limit * 0.9  # 90% após 15,000

    # Gerar relatório
    print("\n=== Relatório de Análise - Ylos Trading ===\n")
    print(f"**Tipo de Conta**: {account_type}")
    print(f"**Saldo Atual**: US${current_balance:,.2f}")
    print(f"**Saldo Mínimo para Saque**: US${min_balance_for_withdrawal:,.2f}")
    print(f"**Lucro Acumulado (Baseado no Saldo)**: US${accumulated_profit:,.2f}")
    print(f"**Dias Operados**: {days_operated} (Mínimo: {min_days_operated})")
    print(f"**Dias Vencedores**: {winning_days} (Mínimo: {min_winning_days}, com pelo menos US${min_winning_amount})")
    print(f"**Regra de Consistência ({consistency_limit*100}%):** {'Violada' if consistency_violation else 'Conforme'}")
    print(f"  - Maior dia de lucro: US${max_day_profit:,.2f} ({consistency_percentage*100:.2f}% do total)")
    print(f"**P/L Drawdown**: {'Violada' if pl_drawdown_violation else 'Conforme'}")
    print(f"  - Limite de perda por trade: US${pl_drawdown_limit:,.2f}")
    print(f"**Risco x Retorno**: {'Violada' if risk_return_violation else 'Conforme'}")
    print(f"  - Mediana dos ganhos: US${median_winning_trade:,.2f}, Limite de perda: US${max_loss_limit:,.2f}")

    if dca_violations:
        print("**DCA (Médio para Trás) Violações**:")
        for violation in dca_violations:
            print(f"  - {violation}")
    else:
        print("**DCA (Médio para Trás)**: Conforme")

    if market_open_violations:
        print("**Abertura do Mercado (9:30 AM NY) Violações**:")
        for violation in market_open_violations:
            print(f"  - {violation}")
    else:
        print("**Abertura do Mercado (9:30 AM NY)**: Conforme")

    print("**Notícias Relevantes**: Não verificado.")
    print("  - A Ylos Trading não especifica quais notícias são relevantes. Recomendamos que você verifique manualmente eventos noticiosos de alto impacto (ex.: ISM Services PMI, decisões do FOMC, Non-Farm Payrolls) durante suas operações.")

    if overnight_violations:
        print("**Overnight/Swing Trading Violações**:")
        for violation in overnight_violations:
            print(f"  - {violation}")
    else:
        print("**Overnight/Swing Trading**: Conforme")

    print(f"**Inatividade**: {'Violada' if inactivity_violation else 'Conforme'} (Última operação há {inactivity_days} dias)")

    if gambling_warning:
        print("**Aviso de Gambling**: Alta variação na quantidade de contratos. Certifique-se de que não está operando de forma inconsistente.")

    print("\n**Elegibilidade para Saque**:")
    print(f"  - {'Elegível' if eligible_for_withdrawal else 'Não Elegível'}")
    if not eligible_for_withdrawal:
        print("  **Motivos para Não Elegibilidade**:")
        if days_operated < min_days_operated:
            print(f"    - Faltam {min_days_operated - days_operated} dias operados.")
        if winning_days < min_winning_days:
            print(f"    - Faltam {min_winning_days - winning_days} dias vencedores.")
        if not balance_meets_requirement:
            print(f"    - Saldo atual (US${current_balance:,.2f}) é inferior ao mínimo (US${min_balance_for_withdrawal:,.2f}).")
        if consistency_violation:
            print(f"    - Violação da regra de consistência ({consistency_percentage*100:.2f}% > {consistency_limit*100}%).")
        if pl_drawdown_violation:
            print("    - Violação do P/L Drawdown.")
        if risk_return_violation:
            print("    - Violação do Risco x Retorno.")
        if dca_violations:
            print("    - Violações de DCA detectadas.")
        if market_open_violations:
            print("    - Operações durante a abertura do mercado detectadas.")
        if overnight_violations:
            print("    - Operações overnight detectadas.")
        if inactivity_violation:
            print("    - Conta inativa por mais de 30 dias.")

    if eligible_for_withdrawal:
        print(f"\n**Limite de Saque Disponível**: US${withdrawal_limit:,.2f}")

    # Recomendações
    print("\n**Recomendações**:")
    if days_operated < min_days_operated:
        print(f"- Opere mais {min_days_operated - days_operated} dias para atingir o mínimo.")
    if winning_days < min_winning_days:
        print(f"- Obtenha mais {min_winning_days - winning_days} dias vencedores com pelo menos US${min_winning_amount} de lucro.")
    if not balance_meets_requirement:
        print(f"- Aumente seu saldo em US${min_balance_for_withdrawal - current_balance:,.2f} para atingir o mínimo.")
    if consistency_violation:
        additional_profit_needed = (max_day_profit / consistency_limit) - total_profit_csv
        print(f"- Para corrigir a regra de consistência, acumule mais US${additional_profit_needed:,.2f} em outros dias.")
    if market_open_violations:
        print("- Evite operar durante a abertura do mercado de NY (9:30 AM NY, janela de 9:25 AM a 9:35 AM NY).")
    print("- Verifique manualmente eventos noticiosos de alto impacto para evitar operar durante esses períodos.")

if __name__ == "__main__":
    analyze_operations()