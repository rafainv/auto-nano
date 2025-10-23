import oci
import time
import re
import os
from dotenv import load_dotenv

load_dotenv()


def trocar_ip_e_atualizar_env():
    """Troca o IP público e atualiza .env"""
    config = oci.config.from_file("config")
    network_client = oci.core.VirtualNetworkClient(config)

    VNIC_ID = os.getenv("VNIC_ID")
    COMPARTMENT_ID = os.getenv("COMPARTMENT_ID")

    try:
        vnic = network_client.get_vnic(VNIC_ID).data
        ip_atual = vnic.public_ip or "nenhum"
        private_ip_id = network_client.list_private_ips(
            vnic_id=VNIC_ID).data[0].id

        try:
            fake_create = oci.core.models.CreatePublicIpDetails(
                compartment_id=COMPARTMENT_ID,
                lifetime="EPHEMERAL",
                private_ip_id=private_ip_id
            )
            network_client.create_public_ip(fake_create)
        except Exception as e:
            match = re.search(
                r'ocid1\.publicip\.oc1\.[a-zA-Z0-9\.\-]+', str(e))
            if not match:
                print("❌ Não foi possível extrair ID atual.")
                return None
            ip_id = match.group(0)

        network_client.delete_public_ip(ip_id)
        time.sleep(20)

        novo_ip = network_client.create_public_ip(
            oci.core.models.CreatePublicIpDetails(
                compartment_id=COMPARTMENT_ID,
                lifetime="EPHEMERAL",
                private_ip_id=private_ip_id
            )
        ).data.ip_address

        if novo_ip and novo_ip != ip_atual:
            atualizar_env("HOST", novo_ip)
            #print(f"✅ IP alterado com sucesso: {ip_atual} ➜ {novo_ip}")
            #print(novo_ip)
            print(f"✅ IP alterado com sucesso.")
            return novo_ip
        else:
            print("⚠️ IP não mudou.")
            return None

    except Exception as e:
        print(f"💥 Erro: {e}")
        return None


def atualizar_env(chave, valor, caminho=".env"):
    """Atualiza ou adiciona variável no arquivo .env"""
    linhas = []
    if os.path.exists(caminho):
        with open(caminho, "r") as f:
            linhas = f.readlines()

    atualizada = False
    nova_linha = f"{chave}={valor}\n"

    for i, linha in enumerate(linhas):
        if linha.startswith(f"{chave}="):
            linhas[i] = nova_linha
            atualizada = True
            break

    if not atualizada:
        linhas.append(nova_linha)

    with open(caminho, "w") as f:
        f.writelines(linhas)


if __name__ == "__main__":
    novo = trocar_ip_e_atualizar_env()
    if not novo:
        print("❌ Falha na troca.")

