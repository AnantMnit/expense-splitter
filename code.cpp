#include <iostream>
#include <vector>
#include <map>
#include <unordered_map>
#include <algorithm>


using namespace std;

class Person{
    public:
    string name;
    map<string,double> balance; 

    Person(string name){
        this->name = name;
    }
};

vector<Person> allPersons;
unordered_map<string,Person* > nameToPerson;
int number_of_persons;

    void DivideEqually(int amt, Person& payerPerson){
        int n;

        cout<<"Enter the number of Persons: "<<endl;
        cin>>n;

        if (n == number_of_persons){
            for (auto& per: allPersons){
                per.balance[payerPerson.name] += (double)(amt)/n;

            }
            return;
        }

        cout<<"Enter the name of consumers: "<<endl;


        for (int i=0;i<n;i++){
            string name;
            cin>>name;

            Person& consumerPerson = *nameToPerson[name];
            consumerPerson.balance[payerPerson.name] += (double)(amt)/n;
            
        }
    }
    void DividePersonByPerson(int amt, Person& payerPerson){
        cout<<"Enter name of consumer and the price of his product: "<<endl;

        while (true){
            string name;
            int money;

            cin>>name;

            if (name == "end") break;

            cin>>money;

            if (name == payerPerson.name)    continue;

            Person& consumerPerson = *nameToPerson[name];

            consumerPerson.balance[payerPerson.name] += money;

        }
    }

    void showCurrBalance(Person& payer){
        // cout<<"show called "<<endl;
        auto payerBalance = payer.balance;
        for (auto& it:payerBalance){
            if (it.first == payer.name)  continue;

            string reciever = it.first;
            auto recieverBalance = (*nameToPerson[reciever]).balance;
            
            double sentMoney = payerBalance[reciever];
            double recievedMoney = recieverBalance[payer.name];
            
            double finalMoney = it.second;

            if (sentMoney > recievedMoney){
                finalMoney = sentMoney - recievedMoney;
                cout<<"\t "<<it.first<< "\t "<<finalMoney<<endl;
            }

            
        }
        // cout<<"show ended "<<endl;
    }
    
    void showBalance(){
        for (auto& payer:allPersons){
            cout<<payer.name<<" will give to : "<<endl;
            showCurrBalance(payer);
        }
    }

int main(){
    cout<<"Enter the name of persons: "<<endl;
    
    while (true){
        string name;
        cin>>name;

        if (name == "end")  break;

        Person tempPerson(name);
        allPersons.push_back(tempPerson);

    }

    number_of_persons = allPersons.size();

    for (int i=0;i<allPersons.size();i++){
        Person currPerson = allPersons[i];
        string name = currPerson.name;

        nameToPerson[allPersons[i].name] = &allPersons[i];
    }

    while (true){
        bool wannaEnd;
        cout<<"Do you wanna End it? "<<endl;
        cin>>wannaEnd;

        if (wannaEnd)   break;


        int amt;
        cout<<"Add Amount: "<<endl;
        cin>>amt;

        string payer;
        cout<<"Paid by: "<<endl;
        cin>>payer;

        Person* ptr = nameToPerson[payer];
        Person payerPerson = *ptr;

        char Mode;

        cout<<"Enter Division Mode: "<<endl;
        cout<<"A. Divide Equally "<<endl;
        cout<<"B. Divide Person By Person "<<endl;
        // cout<<"C. To end it "<<endl;

        cin>>Mode;

        // if (Mode == 'C')  break;

        

        switch(Mode){
            case 'A':
                DivideEqually(amt,payerPerson);
                break;

            case 'B':
                DividePersonByPerson(amt,payerPerson);
                break;
        }
    }

    char wannaShow;
    cout<<"Do you want to see the balance: Y/N"<<endl;
    cin>>wannaShow;

    if (wannaShow == 'Y')   showBalance();
    return 0;
}

