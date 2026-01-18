# 3-Tier Application Deployment (Proxmox/K8s)

Ce projet déploie une application complète à 3 niveaux (Frontend React, API Node.js, et Base de données PostgreSQL) sur un cluster Kubernetes. L'orchestration est pilotée par **Ansible** et le déploiement applicatif est géré par **Helm**.

## 🏗️ Architecture du Projet
* **Frontend** : React (Vite) servi par Nginx.
* **Backend** : API Node.js (Express).
* **Database** : PostgreSQL (StatefulSet).
* **Orchestration** : Kubernetes (Ingress Nginx pour l'exposition).
* **Automation** : Ansible (Playbook de déploiement).

---

## 🚀 Guide de Déploiement

### 1. Prérequis
Avant de lancer le déploiement, assurez-vous d'avoir :
* L'accès `kubectl` configuré vers votre cluster.
* **Ansible** installé avec la collection Kubernetes :
    ```bash
    ansible-galaxy collection install kubernetes.core
    ```
* **Helm** installé sur la machine locale.

### 2. Variables d'Environnement
Le playbook utilise des variables d'environnement pour sécuriser les mots de passe et les accès. Exportez les variables suivantes avant de lancer Ansible :

```bash
# Mot de passe pour la base de données PostgreSQL
export PG_PASSWORD='votre_mot_de-passe_robuste'

# Identifiants DockerHub (pour éviter les limites de pull ou pour images privées)
export DOCKERHUB_USERNAME='votre_username'
export DOCKERHUB_PASSWORD='votre_password_ou_token'
```
### 3. Lancement du Déploiement

Le déploiement se fait via le playbook Ansible situé dans le dossier ansible/.

Déploiement standard :
```bash

ansible-playbook -i inventory.yml playbook-deploy.yml
```
Déploiement complet (Nettoyage préalable) : Si vous souhaitez supprimer l'ancien namespace avant de réinstaller :
```bash
ansible-playbook -i inventory.yml playbook-deploy.yml -e "clean_deploy=true"
```
🛠️ Configuration du Playbook

Le fichier playbook-deploy.yml accepte plusieurs variables pour personnaliser le déploiement :
Variable	Description	Défaut
kube_namespace	Namespace Kubernetes cible	my-app
helm_release	Nom de la release Helm	my-app
clean_deploy	Supprime le namespace avant installation	false
postgres_db	Nom de la base de données	myappdb
postgres_user	Utilisateur PostgreSQL	appuser
🔍 Vérification du déploiement

Une fois le playbook terminé, vérifiez l'état des ressources :
```bash

kubectl get pods -n my-app
kubectl get ingress -n my-app
```
### 4. Installation du Nginx Ingress Controller

Si votre cluster n'a pas encore de contrôleur Ingress, vous devez le déployer avant l'application. Un playbook dédié est fourni pour cela :
```bash
ansible-playbook -i inventory.yml install-nginx-controller.yml

```
Note : Ce playbook installe le contrôleur via Helm dans le namespace ingress-nginx.

L'application est accessible via l'IP de vos Workers sur le port 80 (si hostNetwork est activé) ou via le port affiché dans le résumé Ansible à la fin de l'exécution.

---
