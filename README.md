# 🚀 3-Tier Application Deployment (Proxmox / K8s / GitOps)

Ce projet déploie une application complète (Frontend React, API Node.js, et PostgreSQL) sur un cluster Kubernetes hébergé sur Proxmox. L'infrastructure est pilotée par l'approche **IaC (Ansible)** et le **GitOps (ArgoCD)**.

## 🏗️ Architecture du Projet

* **Frontend** : SPA React (Vite) servie par Nginx.
* **Backend** : API REST Node.js (Express).
* **Database** : PostgreSQL (StatefulSet) avec volumes persistants (PVC).
* **Ingress** : Nginx en mode **DaemonSet** avec `hostNetwork: true` pour une Haute Disponibilité sur le port 80 de chaque worker.
* **Automation** : Ansible pour l'infra et Helm pour le packaging applicatif.
* **GitOps** : ArgoCD assure la synchronisation et le self-healing.

---

## 🔐 Sécurité & Ansible Vault

Nous utilisons **Ansible Vault** pour chiffrer les données sensibles (DockerHub, mots de passe DB) afin de pouvoir versionner le projet sur GitHub sans risque.

### 1. Initialisation du Vault
Si vous repartez de zéro, créez le fichier chiffré :
```bash
ansible-vault create ansible/vars/secrets.yml
```
### 2. Structure requise du fichier secrets.yml
```bash

pg_password: "votre_mot_de_passe_db"
dockerhub_username: "votre_user_dockerhub"
dockerhub_password: "votre_token_dockerhub"
```
### 3. Utilisation lors du déploiement

L'option --ask-vault-pass sera nécessaire pour déchiffrer les secrets au moment de la création du secret Kubernetes regcred.
🚀 Guide de Déploiement

Étape 1 : Prérequis

    kubectl configuré vers votre cluster.

    Ansible avec la collection Kubernetes : ansible-galaxy collection install kubernetes.core.

    Helm v3 installé sur la machine de contrôle.

Étape 2 : Provisioning Infrastructure (Ingress HA)

Cette étape installe le contrôleur Ingress sur tous les workers pour exposer l'application sur leurs IPs respectives (.11, .12, .13).
```bash
cd ansible/
ansible-playbook -i inventory.yml playbook-setup-infra.yml
```
Étape 3 : Déploiement Applicatif

Déploie la base de données, l'API et le Frontend via Helm :
```Bash
ansible-playbook -i inventory.yml playbook-deploy.yml --ask-vault-pass
```
Note : Pour forcer un nettoyage complet avant installation, ajoutez -e "clean_deploy=true".

🔄 Pilotage GitOps (ArgoCD)

Le fichier argocd/application.yaml définit l'état désiré. ArgoCD surveille le dossier helm/charts/my-app/ et synchronise le cluster automatiquement.

Enregistrer l'application :
```bash
kubectl apply -f argocd/application.yaml
```
