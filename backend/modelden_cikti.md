# AI Model Yanıtı

Tarih: 2025-06-10T17:07:23.879Z
Trace ID: quiz-1749575229751-4yuo2
Yanıt Uzunluğu: 7846 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "KVM (Kernel-based Virtual Machine) hangi tip hypervisor'dır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Tip-1 Hypervisor",
        "Tip-2 Hypervisor",
        "Mikro Hypervisor",
        "Hibrit Hypervisor"
      ],
      "correctAnswer": "Tip-1 Hypervisor",
      "explanation": "Metinde KVM'nin Tip-1 Hypervisor olduğu belirtilmiştir. Tip-1 hypervisor'lar doğrudan donanım üzerinde çalışır.",
      "subTopicName": "Kvm Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_hypervisor_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdakilerden hangisi KVM kurulumu için gerekli paketlerden biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "qemu-kvm",
        "virt-manager",
        "libvirt-daemon-system",
        "docker"
      ],
      "correctAnswer": "docker",
      "explanation": "Metinde KVM kurulumu için gerekli paketler arasında qemu-kvm, virt-manager ve libvirt-daemon-system bulunmaktadır. Docker, container teknolojisi ile ilgilidir ve KVM kurulumu için gerekli değildir.",
      "subTopicName": "Kvm Hypervisor Kurulumu",
      "normalizedSubTopicName": "kvm_hypervisor_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "KVM kurulumu için gerekli paketleri kurmak için kullanılan komut aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt install kvm",
        "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
        "sudo yum install kvm",
        "sudo pacman -S kvm"
      ],
      "correctAnswer": "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
      "explanation": "Metinde belirtilen KVM kurulumu için gerekli paketlerin tamamını kurmak için kullanılan komut 'sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils' şeklindedir.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "KVM kurulumu sonrasında libvirtd servisinin otomatik olarak başlamasını sağlamak için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "sudo systemctl start libvirtd",
        "sudo systemctl enable libvirtd",
        "sudo systemctl enable --now libvirtd",
        "sudo libvirtd start"
      ],
      "correctAnswer": "sudo systemctl enable --now libvirtd",
      "explanation": "Metinde libvirtd servisinin hem başlatılması hem de otomatik olarak başlamasının sağlanması için 'sudo systemctl enable --now libvirtd' komutunun kullanılması gerektiği belirtilmiştir.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "/etc/libvirt/qemu.conf dosyasında hangi satırların başındaki '#' işaretinin kaldırılması gerekmektedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "user ve group",
        "pid_file ve log_file",
        "dynamic_ownership ve security_driver",
        "spice_tls ve spice_password"
      ],
      "correctAnswer": "user ve group",
      "explanation": "/etc/libvirt/qemu.conf dosyasında 'user' ve 'group' satırlarının başındaki '#' işaretinin kaldırılması gerektiği metinde belirtilmiştir.",
      "subTopicName": "Libvirt Yapılandırması",
      "normalizedSubTopicName": "libvirt_yapilandirmasi",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "Libvirt servisindeki değişikliklerin etkinleşmesi için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "sudo systemctl start libvirtd.service",
        "sudo systemctl stop libvirtd.service",
        "sudo systemctl restart libvirtd.service",
        "sudo systemctl reload libvirtd.service"
      ],
      "correctAnswer": "sudo systemctl restart libvirtd.service",
      "explanation": "Yapılandırma dosyasındaki değişikliklerin etkinleşmesi için libvirt servisinin yeniden başlatılması gerekmektedir. Bunun için 'sudo systemctl restart libvirtd.service' komutu kullanılır.",
      "subTopicName": "Libvirt Yapılandırması",
      "normalizedSubTopicName": "libvirt_yapilandirmasi",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "Aşağıdaki virt-install komut parametrelerinden hangisi sanal makineye ayrılacak RAM miktarını belirtir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "--vcpu",
        "--ram",
        "--disk",
        "--name"
      ],
      "correctAnswer": "--ram",
      "explanation": "virt-install komutunda '--ram' parametresi sanal makineye ayrılacak RAM miktarını megabayt cinsinden belirtir.",
      "subTopicName": "Virt İnstallıkomutu Kullanımı",
      "normalizedSubTopicName": "virt_installikomutu_kullanimi",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "virt-install komutunda '--os-variant' parametresi neyi ifade eder?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makinenin adını",
        "Sanal makineye kurulacak işletim sistemi ailesini",
        "Sanal makineye ayrılacak disk boyutunu",
        "Sanal makinenin kullanacağı ağ köprüsünü"
      ],
      "correctAnswer": "Sanal makineye kurulacak işletim sistemi ailesini",
      "explanation": "'--os-variant' parametresi, kurulacak işletim sisteminin türünü ve versiyonunu belirtir. Bu, KVM'nin performansı optimize etmesine yardımcı olur.",
      "subTopicName": "Virt İnstallıkomutu Kullanımı",
      "normalizedSubTopicName": "virt_installikomutu_kullanimi",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "Çalışır durumdaki sanal makineyi görüntülemek için kullanılan komut aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "virsh list",
        "virt-viewer",
        "virt-manager",
        "virsh start"
      ],
      "correctAnswer": "virt-viewer",
      "explanation": "Metinde belirtildiği gibi, çalışır durumdaki bir sanal makineyi görüntülemek için 'virt-viewer sanal_makine_adı' komutu kullanılır.",
      "subTopicName": "Virsh Komutları İle Yönetim",
      "normalizedSubTopicName": "virsh_komutlari_ile_yonetim",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Bir sanal makineyi silmek için hangi iki 'virsh' komutu sırasıyla kullanılmalıdır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "virsh shutdown ve virsh undefine",
        "virsh destroy ve virsh undefine",
        "virsh suspend ve virsh undefine",
        "virsh reboot ve virsh undefine"
      ],
      "correctAnswer": "virsh destroy ve virsh undefine",
      "explanation": "Bir sanal makineyi silmek için önce 'virsh destroy sanal_makine_adı' komutu ile makine kapatılmalı, ardından 'virsh undefine sanal_makine_adı' komutu ile sanal makine tanımı silinmelidir.",
      "subTopicName": "Virsh Komutları İle Yönetim",
      "normalizedSubTopicName": "virsh_komutlari_ile_yonetim",
      "difficulty": "medium"
    }
  ]
}
```
```
