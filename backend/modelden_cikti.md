# AI Model Yanıtı

Tarih: 2025-06-06T04:43:04.877Z
Trace ID: quiz-1749184970062-uhl5g
Yanıt Uzunluğu: 9129 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "KVM hypervisor kurulumu için gerekli paketlerden biri aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "qemu-kvm",
        "docker",
        "virtualbox",
        "vmware"
      ],
      "correctAnswer": "qemu-kvm",
      "explanation": "KVM kurulumu için qemu-kvm paketi gereklidir. Diğer seçenekler farklı sanallaştırma çözümlerine aittir. Metinde 'sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils' komutu ile bu paketlerin kurulumu belirtilmiştir.",
      "subTopicName": "Kvm Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_hypervisor_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdakilerden hangisi KVM kurulumunda kullanılan bir araç değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "virt-manager",
        "qemu-img",
        "virsh",
        "docker-compose"
      ],
      "correctAnswer": "docker-compose",
      "explanation": "Docker-compose, container orkestrasyon aracıdır, KVM ile ilgili değildir. Virt-manager, qemu-img ve virsh KVM kurulumunda kullanılan araçlardır. Metinde 'sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils' komutu ile virt-manager kurulumu belirtilmiştir.",
      "subTopicName": "Kvm Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_hypervisor_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "KVM kurulumu için gerekli paketlerin kurulumunda kullanılan komut aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt update",
        "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
        "sudo systemctl enable --now libvirtd",
        "sudo usermod -aG kvm $USER"
      ],
      "correctAnswer": "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
      "explanation": "Bu komut, KVM için gerekli olan tüm paketleri kurar. Diğer komutlar farklı amaçlara hizmet eder. Metinde 'sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils' komutu ile bu paketlerin kurulumu belirtilmiştir.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdakilerden hangisi KVM için gerekli paketlerin kurulum adımlarından biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Paket listesini güncelleme",
        "Gerekli paketleri kurma",
        "Firewall yapılandırması",
        "Bağımlılıkları çözme"
      ],
      "correctAnswer": "Firewall yapılandırması",
      "explanation": "Firewall yapılandırması doğrudan KVM paket kurulum adımlarından biri değildir. Paket listesini güncelleme, gerekli paketleri kurma ve bağımlılıkları çözme, paket kurulum sürecinin parçalarıdır. Metinde 'sudo apt update' ile paket listesi güncellenir ve 'sudo apt install' ile paketler kurulur.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "Libvirtd servisinin otomatik olarak başlamasını sağlamak için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo systemctl start libvirtd",
        "sudo systemctl enable libvirtd",
        "sudo systemctl restart libvirtd",
        "sudo systemctl status libvirtd"
      ],
      "correctAnswer": "sudo systemctl enable libvirtd",
      "explanation": "sudo systemctl enable libvirtd komutu, sistem yeniden başlatıldığında libvirtd servisinin otomatik olarak başlamasını sağlar. Metinde 'sudo systemctl enable --now libvirtd' komutu ile bu servis aktif hale getirilir.",
      "subTopicName": "Libvirtd Servisini Yapılandırma",
      "normalizedSubTopicName": "libvirtd_servisini_yapilandirma",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "Aşağıdakilerden hangisi libvirtd servisinin durumunu kontrol etmek için kullanılan komuttur?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo systemctl start libvirtd",
        "sudo systemctl enable libvirtd",
        "sudo systemctl restart libvirtd",
        "sudo systemctl status libvirtd"
      ],
      "correctAnswer": "sudo systemctl status libvirtd",
      "explanation": "sudo systemctl status libvirtd komutu, libvirtd servisinin çalışıp çalışmadığını ve diğer durum bilgilerini gösterir. Metinde 'sudo systemctl status libvirtd' komutu ile servis durumunun kontrol edildiği belirtilmiştir.",
      "subTopicName": "Libvirtd Servisini Yapılandırma",
      "normalizedSubTopicName": "libvirtd_servisini_yapilandirma",
      "difficulty": "easy"
    },
    {
      "id": "q7",
      "questionText": "Kullanıcının KVM sanal makinelerini yönetebilmesi için hangi gruplara eklenmesi gerekir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "kvm ve libvirt",
        "root ve admin",
        "qemu ve kvm",
        "libvirt ve qemu"
      ],
      "correctAnswer": "kvm ve libvirt",
      "explanation": "Kullanıcının KVM sanal makinelerini yönetebilmesi için kvm ve libvirt gruplarına eklenmesi gerekir. Metinde 'sudo usermod -aG kvm $USER' ve 'sudo usermod -aG libvirt $USER' komutları ile bu gruplara ekleme yapıldığı belirtilmiştir.",
      "subTopicName": "Kullanıcı Yetkilendirmesi",
      "normalizedSubTopicName": "kullanici_yetkilendirmesi",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "Kullanıcıyı kvm ve libvirt gruplarına eklemek için hangi komutlar kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo adduser $USER kvm ve sudo adduser $USER libvirt",
        "sudo usermod -aG kvm $USER ve sudo usermod -aG libvirt $USER",
        "sudo groupadd kvm ve sudo groupadd libvirt",
        "sudo chown $USER kvm ve sudo chown $USER libvirt"
      ],
      "correctAnswer": "sudo usermod -aG kvm $USER ve sudo usermod -aG libvirt $USER",
      "explanation": "sudo usermod -aG kvm $USER ve sudo usermod -aG libvirt $USER komutları, kullanıcıyı kvm ve libvirt gruplarına eklemek için kullanılır. Metinde bu komutlar aynen belirtilmiştir.",
      "subTopicName": "Kullanıcı Yetkilendirmesi",
      "normalizedSubTopicName": "kullanici_yetkilendirmesi",
      "difficulty": "easy"
    },
    {
      "id": "q9",
      "questionText": "`virt-install` komutunda kullanılan `--disk path=/var/lib/libvirt/images/testVM.img,size=30` parametresi neyi ifade eder?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makinenin adını",
        "Sanal makineye ayrılan RAM miktarını",
        "Sanal makine diskinin konumunu ve boyutunu",
        "Sanal makine için kullanılacak işletim sistemi varyantını"
      ],
      "correctAnswer": "Sanal makine diskinin konumunu ve boyutunu",
      "explanation": "Bu parametre, sanal makine diskinin /var/lib/libvirt/images/testVM.img konumunda oluşturulacağını ve boyutunun 30 GB olacağını belirtir. Metinde 'sudo virt-install --name=testVM ... --disk path=/var/lib/libvirt/images/testVM.img,size=30 ...' komutu ile disk parametresi örneği verilmiştir.",
      "subTopicName": "Virt İnstallıkomutu Kullanımı",
      "normalizedSubTopicName": "virt_installikomutu_kullanimi",
      "difficulty": "medium"
    },
    {
      "id": "q10",
      "questionText": "`virt-install` komutunda `--cdrom=/home/hpXX/Downloads/ubuntu-22.04.1-desktop-amd64.iso` parametresi ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makineye verilecek ismi belirtir.",
        "Sanal makineye ISO imajını bağlar.",
        "Sanal makineye ayrılacak işlemci sayısını belirtir.",
        "Sanal makinenin kullanacağı ağ köprüsünü belirtir."
      ],
      "correctAnswer": "Sanal makineye ISO imajını bağlar.",
      "explanation": "Bu parametre, sanal makine kurulumu için kullanılacak ISO imajının konumunu belirtir. Bu sayede sanal makine, belirtilen ISO dosyası üzerinden başlatılabilir. Metinde 'sudo virt-install --name=testVM ... --cdrom=/home/hpXX/Downloads/ubuntu-22.04.1-desktop-amd64.iso ...' komutu ile cdrom parametresi örneği verilmiştir.",
      "subTopicName": "Virt İnstallıkomutu Kullanımı",
      "normalizedSubTopicName": "virt_installikomutu_kullanimi",
      "difficulty": "medium"
    }
  ]
}
```
```
